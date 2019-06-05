exports.schemas = ({ ObjectId, Virtual }) => ({
  Employee: {
    name: {
      type: String
    },
    birthdate: {
      type: Date
    },
    age: {
      type: Virtual,
      select: ["birthdate"],
      get: ({ birthdate }) => {
        const today = new Date(2020, 0, 1);
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDiff = today.getMonth() - birthdate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthdate.getDate())
        ) {
          age--;
        }
        return age;
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
      birthdate: new Date(1993, 6, 27)
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

exports.test = async ({ Community }) => {
  const communities = await Community.find().select(["name", "admin.age"]);
  expect(communities).toMatchInlineSnapshot(`
        Array [
          Object {
            "_id": "346261656538346166376139",
            "admin": Object {
              "_id": "333063366464323339346335",
              "birthdate": 1993-07-27T00:00:00.000Z,
            },
            "name": "Potomace Place",
          },
        ]
    `);
  expect(communities[0].admin.age).toMatchInlineSnapshot(`26`);
};
