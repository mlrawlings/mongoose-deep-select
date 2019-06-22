exports.schemas = ({ ObjectId }) => ({
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
      community: oid("PP")
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
  const employee = await Employee.findOne().select(["name"]);
  expect(employee).toMatchInlineSnapshot(`
            Object {
              "_id": "333063366464323339346335",
              "name": "Nicholas",
            }
      `);
  await employee.select(["community.name"]);
  expect(employee).toMatchInlineSnapshot(`
    Object {
      "_id": "333063366464323339346335",
      "community": Object {
        "_id": "346261656538346166376139",
        "name": "Potomac Place",
      },
      "name": "Nicholas",
    }
  `);
};
