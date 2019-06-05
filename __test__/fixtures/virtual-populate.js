exports.schemas = ({ ObjectId, Virtual }) => ({
  Employee: {
    name: {
      type: String
    },
    community: {
      type: ObjectId,
      ref: "Community"
    }
  },
  Community: {
    name: {
      type: String
    },
    employees: {
      type: Virtual,
      ref: "Employee",
      localField: "_id",
      foreignField: "community"
    }
  }
});

exports.data = oid => ({
  Employee: [
    {
      _id: oid("NR"),
      name: "Nicholas",
      community: oid("PP")
    },
    {
      _id: oid("KJ"),
      name: "Kendall",
      community: oid("PP")
    }
  ],
  Community: [
    {
      _id: oid("PP"),
      name: "Potomace Place"
    }
  ]
});

exports.test = async ({ Community }) => {
  const communities = await Community.find().select(["name", "employees.name"]);
  expect(communities).toMatchInlineSnapshot(`
            Array [
              Object {
                "_id": "346261656538346166376139",
                "name": "Potomace Place",
              },
            ]
      `);
  expect(communities[0].employees).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "633339333864643831666531",
        "community": "346261656538346166376139",
        "name": "Nicholas",
      },
      Object {
        "_id": "613062316439303534623237",
        "community": "346261656538346166376139",
        "name": "Kendall",
      },
    ]
  `);
};
