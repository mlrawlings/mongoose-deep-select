exports.schemas = ({ ObjectId, Virtual }) => ({
  Person: {
    name: {
      type: String,
      label: "Name",
      primary: true
    },
    address: {
      type: String,
      label: "Address"
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
    people: {
      type: Virtual,
      label: "People",
      ref: "Person",
      localField: "_id",
      foreignField: "community"
    }
  }
});

exports.test = async ({ Community }) => {
  expect(Community.getLabel("name")).toMatchInlineSnapshot(`"Name"`);
  expect(Community.getLabel("people.name")).toMatchInlineSnapshot(
    `"People"`
  );
  expect(Community.getLabel("people.address")).toMatchInlineSnapshot(
    `"People Address"`
  );
};
