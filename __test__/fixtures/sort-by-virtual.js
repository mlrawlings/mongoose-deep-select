exports.schemas = ({ Virtual }) => ({
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
  }
});

exports.data = oid => ({
  Employee: [
    {
      _id: oid("NDR"),
      name: "Nicholas",
      birthdate: new Date(1993, 6, 27)
    },
    {
      _id: oid("MLR"),
      name: "Michael",
      birthdate: new Date(1990, 6, 9)
    },
    {
      _id: oid("EER"),
      name: "Emily",
      birthdate: new Date(1995, 5, 4)
    }
  ]
});

exports.test = async ({ Employee }) => {
  const employees = await Employee.find()
    .select(["name"])
    .sort({ age: -1 });
  expect(employees).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "313538306239613739333563",
        "birthdate": 1990-07-09T00:00:00.000Z,
        "name": "Michael",
      },
      Object {
        "_id": "333063366464323339346335",
        "birthdate": 1993-07-27T00:00:00.000Z,
        "name": "Nicholas",
      },
      Object {
        "_id": "316433663061626434316664",
        "birthdate": 1995-06-04T00:00:00.000Z,
        "name": "Emily",
      },
    ]
  `);
};
