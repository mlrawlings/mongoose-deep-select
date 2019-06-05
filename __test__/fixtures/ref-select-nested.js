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
      name: "Potomac Place",
      website: "https://potomacplace.com"
    }
  ]
});

exports.test = async ({ Employee }) => {
  expect(await Employee.find().select(["name", "community.website"]))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "333063366464323339346335",
        "community": Object {
          "_id": "346261656538346166376139",
          "website": "https://potomacplace.com",
        },
        "name": "Nicholas",
      },
    ]
  `);
};
