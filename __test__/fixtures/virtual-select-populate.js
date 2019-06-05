exports.schemas = ({ ObjectId, Virtual }) => ({
  Employee: {
    name: {
      type: String
    },
    community: {
      type: ObjectId,
      ref: "Community"
    },
    isAdmin: {
      type: Virtual,
      select: ["_id", "community.admin"],
      get: ({ _id, community }) => {
        return _id.equals(community.admin._id || community.admin);
      }
    }
  },
  Community: {
    name: {
      type: String
    },
    admin: {
      type: ObjectId,
      ref: "Employee"
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
      name: "Potomace Place",
      admin: oid("NDR")
    }
  ]
});

exports.test = async ({ Employee }) => {
  const employees = await Employee.find().select(["name", "isAdmin"]);
  expect(employees).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "333063366464323339346335",
        "community": Object {
          "_id": "346261656538346166376139",
          "admin": "333063366464323339346335",
        },
        "name": "Nicholas",
      },
    ]
  `);
  expect(employees[0].isAdmin).toMatchInlineSnapshot(`true`);
};
