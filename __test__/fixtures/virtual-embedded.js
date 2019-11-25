exports.schemas = ({ Virtual }) => ({
  Employee: {
    name: {
      first: {
        type: String
      },
      last: {
        type: String
      },
      full: {
        type: Virtual,
        select: ["name.first", "name.last"],
        get: ({ name: { first, last } }) => `${first} ${last}`
      }
    }
  }
});

exports.data = oid => ({
  Employee: [
    {
      _id: oid("ABC"),
      name: {
        first: "Alex",
        last: "Chui"
      }
    }
  ]
});

exports.test = async ({ Employee }) => {
  const employees = await Employee.find().select(["name.full"]);
  expect(employees).toMatchInlineSnapshot(`
    Array [
      Object {
        "_id": "393032666264643262316466",
        "name": Object {
          "first": "Alex",
          "last": "Chui",
        },
      },
    ]
  `);
  expect(employees[0].name.full).toMatchInlineSnapshot(`"Alex Chui"`);
};
