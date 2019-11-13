const Virtual = Symbol("Virtual");

const patchedObjects = new WeakSet();
const sortObjects = new WeakMap();
const selectTrees = new WeakMap();
const contexts = new WeakMap();
const virtuals = new WeakMap();

module.exports = function patchMongoose (mongoose) {
  mongoose.Schema = patchSchema(mongoose.Schema, mongoose);
  mongoose.Query = patchQuery(mongoose.Query);
  mongoose.Document = patchDocument(mongoose.Document);
  return mongoose;
};

function patchSchema(OriginalSchema, mongoose) {
  const Schema = function(def, ...rest) {
    this.base = mongoose;
    const virtualDefs = extractVirtuals(def);
    const computedDefs = extractComputed(def);
    const computed = Object.entries(computedDefs);
    OriginalSchema.call(this, def, ...rest);
    virtuals.set(this, virtualDefs);
    Object.entries(virtualDefs).forEach(([path, def]) => {
      const virtual = this.virtual(path, def.ref ? {
        ref: def.ref,
        localField: def.localField,
        foreignField: def.foreignField,
        justOne: def.justOne,
        options: def.options
      } : {});
      if (def.get) {
        virtual.get(function() {
          return def.get(this, {});
        });
      }
    });
    if (computed.length) {
      this.pre("save", async function(next) {
        const toSelect = new Set();
        const needComputing = computed.filter(([, def]) => {
          if (def.select.some(path => this.isModified(path))) {
            def.select.forEach(path => toSelect.add(path));
            return true;
          }
        });

        await this.select(Array.from(toSelect));

        needComputing.forEach(([path, def]) => {
          this.set(path, def.get(this));
        });

        next();
      });
    }
    this.static("getLabel", function(path) {
      const [label] = getLabel(this, path.split("."));
      return label;
    });
  };
  Object.assign(Schema, OriginalSchema);
  Schema.prototype = Object.create(OriginalSchema.prototype);
  Schema.base = mongoose;
  Schema.Types = Object.assign({ Virtual }, OriginalSchema.Types);
  return Schema;
}

function patchDocument(Document) {
  if (patchedObjects.has(Document)) return Document;
  Document.prototype.select = async function(selectedFields) {
    if (Array.isArray(selectedFields)) {
      selectedFields = selectedFields.filter(path => !this.isSelected(path));
      if (!selectedFields.length) return this;
    } else {
      throw new Error("document.select only supports passing an array of paths");
    }

    const additional = await this.constructor.findOne({ _id:this.id }).select(selectedFields);
    mergeTrees(additional, this, additional.toObject());
    selectedFields.forEach(path => {
      this.unmarkModified(path);
    });

    return this;
  }
  return Document;
}

function patchQuery(Query) {
  if (patchedObjects.has(Query)) return Query;

  const originalSort = Query.prototype.sort;
  const originalSelect = Query.prototype.select;
  const originalExec = Query.prototype.exec;

  Query.prototype.context = function patchedContext(context) {
    contexts.set(this, context);
    return this;
  }

  Query.prototype.sort = function patchedSort(sort) {
    if (!sort || typeof sort === 'string') {
      return originalSort.apply(this, arguments);
    } else if (!hasPopulatedOrVirtual(this, Object.keys(sort))) {
      return originalSort.apply(this, arguments);
    }

    let tree = selectTrees.get(this);
    if (!tree) {
      selectTrees.set(this, tree = {});
    }
    addPathsToTree(Object.keys(sort), tree);

    sortObjects.set(this, sort);
    return this;
  }

  Query.prototype.select = function patchedSelect(select) {
    if (!select || typeof select === 'string') {
      return originalSelect.apply(this, arguments);
    } else if (!hasPopulatedOrVirtual(this, select)) {
      if (Array.isArray(select)) {
        return originalSelect.call(this, select.join(' '));
      } else {
        return originalSelect.apply(this, arguments);
      }
    }

    let tree = selectTrees.get(this);
    if (!tree) {
      selectTrees.set(this, tree = {});
    }

    if (Array.isArray(select)) {
      addPathsToTree(select, tree);
    } else {
      mergeTrees(select, tree);
    }

    return this;
  }

  Query.prototype.exec = async function patchedExec(cb) {
    try {
      const tree = selectTrees.get(this);
      const sort = sortObjects.get(this);
      if (tree) {
        const [populate, select] = getPopulateAndSelect(this.model, tree);
        if (select || populate) {
          this.select(select || "_id");
        }
        if (populate) {
          this.populate(populate);
        }
      }
      let result = await originalExec.call(this);
      if (sort) {
        result = result.sort((a, b) => {
          for (const key in sort) {
            const aVal = get(a, key);
            const bVal = get(b, key);
            if (aVal > bVal) {
              return sort[key];
            } else if (aVal < bVal) {
              return -1 * sort[key];
            }
          }
          return 0;
        });
      }

      if (cb) cb(null, result);
      else return result;
    } catch (error) {
      if (cb) cb(error);
      else throw error;
    }
  }

  patchedObjects.add(Query);

  return Query;
}

function getLabel(Model, [key, ...rest], prefix = "") {
  const mongoose = Model.base;
  const schema = Model.schema;

  key = prefix + key;

  switch(schema.pathType(key)) {
    case "real": {
      const match = schema.paths[key];
      if (match.options.ref && rest.length) {
        const label = match.options.label;
        const ChildModel = mongoose.models[match.options.ref];
        const [childLabel, isPrimary] = getLabel(ChildModel, rest);
        return [isPrimary ? label : label + " " + childLabel, isPrimary && match.options.primary];
      } else {
        return [match.options.label, match.options.primary];
      }
    }
    case "virtual": {
      const virtual = (virtuals.get(schema) || {})[key];
      if (virtual.ref) {
        const label = virtual.label;
        const ChildModel = mongoose.models[virtual.ref];
        const [childLabel, isPrimary] = getLabel(ChildModel, rest);
        return [isPrimary ? label : label + " " + childLabel, isPrimary && virtual.primary];
      } else {
        return [virtual.label, virtual.primary];
      }
    }
    case "nested": {
      return getLabel(Model, rest, `${key}.`);
    }
  }
}

function getPopulateAndSelect(Model, tree, prefix = "") {
  const mongoose = Model.base;
  const schema = Model.schema;
  let populate;
  let select;
  Object.keys(tree).forEach(key => {
    if (key === "*") return;
    const path = prefix + key;
    switch(schema.pathType(path)) {
      case "real": {
        const match = schema.paths[path];
        const childTree = tree[key];
        const hasNestedSelect = Object.keys(childTree).length > 0;
        if (match.options.ref && hasNestedSelect) {
          const ChildModel = mongoose.models[match.options.ref];
          const [childPopulate, childSelect] = getPopulateAndSelect(ChildModel, childTree);
          populate = populate || [];
          populate.push({
            path: path,
            populate: childPopulate,
            select: childSelect
          });
        } else {
          select = select || [];
          select.push(path);
        }
        break;
      }
      case "virtual": {
        const virtual = (virtuals.get(schema) || {})[path];
        if (virtual.ref) {
          const childTree = tree[key];
          const ChildModel = mongoose.models[virtual.ref];
          const [childPopulate, childSelect] = getPopulateAndSelect(ChildModel, childTree);
          populate = populate || [];
          populate.push({
            path: path,
            populate: childPopulate,
            select: childSelect,
            match: virtual.match
          });
        } else if (virtual.select) {
          const virtualTree = addPathsToTree(virtual.select, {})
          const [virtualPopulate, virtualSelect] = getPopulateAndSelect(Model, virtualTree);
          if (virtualPopulate) {
            populate = populate || [];
            populate.push(...virtualPopulate);
          }
          if (virtualSelect) {
            select = select || [];
            select.push(...virtualSelect.split(" "));
          }
        }
        break;
      }
      case "nested": {
        const nestedTree = tree[key];
        const [nestedPopulate, nestedSelect] = getPopulateAndSelect(Model, nestedTree, `${path}.`);
        if (nestedPopulate) {
          populate = populate || [];
          populate.push(...nestedPopulate);
        }
        if (nestedSelect) {
          select = select || [];
          select.push(...nestedSelect.split(" "));
        }
        break;
      }
      default: {
        console.warn(`invalid path: ${key}`);
      }
    }
  });
  return [populate, select && select.join(' ')];
}

function addPathsToTree(paths, tree) {
  for (const path of paths) {
    const parts = path.split('.');
    let current = tree;
    for (const part of parts) {
      current = current[part] = current[part] || {};
    }
  }

  return tree;
}

function mergeTrees(source, target, keyTree = source) {
  Object.keys(keyTree).forEach(key => {
    if (typeof source[key] === "object" && typeof target[key] === "object") {
      mergeTrees(source[key], target[key], keyTree[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
}

function hasPopulatedOrVirtual(Model, keys) {
  const schema = Model.schema;
  if (!Array.isArray(keys)) {
    keys = Object.keys(keys);
  }
  return keys.some(key => {
    let parts = [];
    for (const part of key.split('.')) {
      parts.push(part);
      const path = parts.join(".");
      switch(schema.pathType(path)) {
        case "real": {
          return !!schema.paths[path].options.ref
        }
        case "virtual": {
          return true
        }
        case "nested": {
          break;
        }
        default: {
          console.warn(`invalid path: ${key}`);
          return false;
        }
      }
    }
  });
}

function extractVirtuals(def) {
  const virtuals = {};
  Object.entries(def).forEach(([key, value]) => {
    if (value && value.type === Virtual) {
      delete def[key];
      virtuals[key] = value;
    } else if (typeof value === "object") {
      const nestedVirtuals = extractVirtuals(value);
      if (!Object.keys(value).length) {
        delete def[key];
      }
      Object.entries(nestedVirtuals).forEach(([nestedKey, value]) => {
        virtuals[key + "." + nestedKey] = value;
      });
    }
  });
  return virtuals;
}

function extractComputed(def) {
  const computed = {};
  Object.entries(def).forEach(([key, value]) => {
    if (value && typeof value.get === "function" && value.select) {
      computed[key] = { get:value.get, select:value.select };
      delete value.get;
      delete value.select;
    } else if (typeof value === "object") {
      const nestedComputed = extractComputed(value);
      Object.entries(nestedComputed).forEach(([nestedKey, value]) => {
        computed[key + "." + nestedKey] = value;
      });
    }
  });
  return computed;
}

function get(obj, props) {
  if (!obj) {
    return obj;
  }
  if (typeof props == 'string') {
    props = props.split('.');
  }
  if (typeof props == 'symbol') {
    props = [props];
  }
  var prop;
  while (props.length) {
    prop = props.shift();
    obj = obj[prop];
    if (!obj) {
      return obj;
    }
  }
  return obj;
}
