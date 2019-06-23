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
    }
  }
});

exports.data = oid => ({
  Employee: [
    {
      _id: oid("NDR"),
      name: "Nicholas",
      community: oid("PP")
    },
    {
      _id: oid("MLR"),
      name: "Michael",
      community: oid("OLOP")
    },
    {
      _id: oid("EER"),
      name: "Emily",
      community: oid("OLOH")
    }
  ],
  Community: [
    {
      _id: oid("PP"),
      name: "Potomac Place"
    },
    {
      _id: oid("OLOP"),
      name: "Our Lady of Peace"
    },
    {
      _id: oid("OLOH"),
      name: "Our Lady of Hope"
    }
  ]
});

exports.test = async ({ Employee }) => {
  const employees = await Employee.find()
    .select(["name"])
    .sort({ "community.name": 1 });
  expect(employees).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "316433663061626434316664",
        "community": Object {
          "_id": "316237366432316431343965",
          "name": "Our Lady of Hope",
        },
        "name": "Emily",
      },
      Object {
        "_id": "313538306239613739333563",
        "community": Object {
          "_id": "653762303038616438383335",
          "name": "Our Lady of Peace",
        },
        "name": "Michael",
      },
      Object {
        "_id": "333063366464323339346335",
        "community": Object {
          "_id": "346261656538346166376139",
          "name": "Potomac Place",
        },
        "name": "Nicholas",
      },
    ]
  `);
};
