const fs = require("fs");
const md5 = require("md5");
const path = require("path");
const Mongoose = require("mongoose").Mongoose;
const mongooseSuperSelect = require("../index");
const dbId = Math.round(Math.random() * 1000000000);
const dbPath = `mongodb://localhost:27017/test-${dbId}`;
const fixturesDir = path.join(__dirname, "fixtures");

let idCounter = 0;

fs.readdirSync(fixturesDir).forEach(fixtureName => {
  it(fixtureName, async () => {
    const mongoose = mongooseSuperSelect(new Mongoose());
    await mongoose.connect(dbPath, { useNewUrlParser: true });
    try {
      const fixture = require(path.join(fixturesDir, fixtureName));
      const SchemaTypes = mongoose.Schema.Types;
      const ObjectId = mongoose.Types.ObjectId;
      const oid = (key = ++idCounter) => {
        if (key instanceof ObjectId) return key;
        return ObjectId(md5(key.toString()).substring(0, 12));
      };
      const schemas = fixture.schemas(SchemaTypes);
      const data = fixture.data ? fixture.data(oid) : {};
      const models = {};
      Object.keys(schemas).forEach(schemaName => {
        const schema = new mongoose.Schema(schemas[schemaName]);
        models[schemaName] = mongoose.model(schemaName, schema);
      });
      await Promise.all(
        Object.keys(data).map(async modelName => {
          const Model = models[modelName];
          const documents = data[modelName];
          await Promise.all(
            documents.map(async data => {
              await Model.create(data);
            })
          );
        })
      );
      await fixture.test(models);
    } finally {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });
});