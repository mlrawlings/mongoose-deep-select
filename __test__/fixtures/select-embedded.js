exports.schemas = ({ Virtual }) => ({
  Person: {
    name: {
      first: {
        type: String,
        label: "First Name"
      },
      last: {
        type: String,
        label: "Last Name"
      },
      full: {
        type: Virtual,
        label: "Name",
        select: ["name.first", "name.last"],
        primary: true,
        get: ({ name }) => {
          return `${name.first} ${name.last}`;
        }
      }
    }
  }
});

exports.data = oid => ({
  Person: [
    {
      _id: oid("MLR"),
      name: {
        first: "Michael",
        last: "Rawlings"
      }
    }
  ]
});

exports.test = async ({ Person }) => {
  const person = await Person.findOne().select(["name.first"]);
  expect(person).toMatchInlineSnapshot(`
            Object {
              "_id": "313538306239613739333563",
              "name": Object {
                "first": "Michael",
              },
            }
      `);
  await person.select(["name.full"]);
  expect(person).toMatchInlineSnapshot(`
        Object {
          "_id": "313538306239613739333563",
          "name": Object {
            "first": "Michael",
            "last": "Rawlings",
          },
        }
    `);
  expect(person.name.full).toMatchInlineSnapshot(`"Michael Rawlings"`);
};
