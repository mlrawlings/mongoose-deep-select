exports.schemas = ({ ObjectId }) => ({
  Employee: {
    name: {
      type: String
    },
    community: {
      type: ObjectId,
      ref: "Community"
    },
    birthdate: {
      type: Date
    }
  },
  Community: {
    name: {
      type: String
    },
    website: {
      type: String
    }
  }
});

exports.data = oid => ({
  Employee: [
    {
      _id: oid("NDR"),
      name: "Nicholas",
      community: oid("PP"),
      birthdate: new Date(1993, 6, 27)
    }
  ],
  Community: [
    {
      _id: oid("PP"),
      name: "Potomac Place"
    }
  ]
});

exports.test = async ({ Employee }) => {
  expect(await Employee.find().select(["name", "community"]))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "333063366464323339346335",
        "community": "346261656538346166376139",
        "name": "Nicholas",
      },
    ]
  `);
};
