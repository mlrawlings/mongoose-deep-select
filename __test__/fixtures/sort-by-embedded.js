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
    },
    {
      _id: oid("RHB"),
      name: {
        first: "Ryan",
        last: "Britton"
      }
    }
  ]
});

exports.test = async ({ Person }) => {
  const people = await Person.find().sort({ "name.last": 1 });
  expect(people).toMatchInlineSnapshot(`
    Array [
      Object {
        "__v": 0,
        "_id": "303531623861326135376265",
        "name": Object {
          "first": "Ryan",
          "last": "Britton",
        },
      },
      Object {
        "__v": 0,
        "_id": "313538306239613739333563",
        "name": Object {
          "first": "Michael",
          "last": "Rawlings",
        },
      },
    ]
  `);
};
