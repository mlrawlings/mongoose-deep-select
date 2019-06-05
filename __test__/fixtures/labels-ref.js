exports.schemas = ({ ObjectId }) => ({
  Person: {
    name: {
      type: String,
      label: "Name",
      primary: true
    },
    community: {
      type: ObjectId,
      ref: "Community",
      label: "Community"
    }
  },
  Community: {
    name: {
      type: String,
      label: "Name",
      primary: true
    },
    address: {
      type: String,
      label: "Address"
    }
  }
});

exports.test = async ({ Person }) => {
  expect(Person.getLabel("name")).toMatchInlineSnapshot(`"Name"`);
  expect(Person.getLabel("community.name")).toMatchInlineSnapshot(
    `"Community"`
  );
  expect(Person.getLabel("community.address")).toMatchInlineSnapshot(
    `"Community Address"`
  );
};
