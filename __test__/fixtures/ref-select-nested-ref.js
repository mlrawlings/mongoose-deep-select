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
    },
    region: {
      type: ObjectId,
      ref: "Region"
    }
  },
  Region: {
    name: {
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
      website: "https://potomacplace.com",
      region: oid("NOVA")
    }
  ],
  Region: [
    {
      _id: oid("NOVA"),
      name: "Northern VA"
    }
  ]
});

exports.test = async ({ Employee }) => {
  expect(
    await Employee.find().select(["name", "community.name", "community.region.name"])
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "333063366464323339346335",
        "community": Object {
          "_id": "346261656538346166376139",
          "name": "Potomac Place",
          "region": Object {
            "_id": "353533363438633830383862",
            "name": "Northern VA",
          },
        },
        "name": "Nicholas",
      },
    ]
  `);
};
