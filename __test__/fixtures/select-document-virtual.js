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
  await employee.select(["age"]);
  expect(employee).toMatchInlineSnapshot(`
    Object {
      "_id": "333063366464323339346335",
      "birthdate": 1993-07-27T00:00:00.000Z,
      "name": "Nicholas",
    }
  `);
  expect(employee.age).toMatchInlineSnapshot(`26`);
};
