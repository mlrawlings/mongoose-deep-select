exports.schemas = () => ({
  Employee: {
    name: {
      first: {
        type: String
      },
      last: {
        type: String
      },
      full: {
        type: String,
        select: ["name.first", "name.last"],
        get: ({ name: { first, last } }) => `${first} ${last}`
      }
    }
  }
});

exports.data = oid => ({
  Employee: [
    {
      _id: oid("NDR"),
      name: {
        first: "Nicholas",
        last: "Rawlings"
      }
    }
  ]
});

exports.test = async ({ Employee }) => {
  const employees = await Employee.find().select(["name.first", "name.full"]);
  expect(employees).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "333063366464323339346335",
        "name": Object {
          "first": "Nicholas",
          "full": "Nicholas Rawlings",
        },
      },
    ]
  `);
  employees[0].name.first = "Michael";
  await employees[0].save();
  const employeesAgain = await Employee.find().select(["name.first", "name.full"]);
  expect(employeesAgain).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "333063366464323339346335",
        "name": Object {
          "first": "Michael",
          "full": "Michael Rawlings",
        },
      },
    ]
  `);
};
