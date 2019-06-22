exports.schemas = () => ({
  Employee: {
    name: {
      type: String
    },
    birthdate: {
      type: Date
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
  await employee.select(["birthdate"]);
  expect(employee).toMatchInlineSnapshot(`
    Object {
      "_id": "333063366464323339346335",
      "birthdate": 1993-07-27T00:00:00.000Z,
      "name": "Nicholas",
    }
  `);
};
