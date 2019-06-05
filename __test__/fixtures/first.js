exports.schemas = () => ({
  Person: {
    name: {
      type: String
    }
  }
});

exports.data = oid => ({
  Person: [
    {
      _id: oid("Anna"),
      name: "Anna"
    }
  ]
});

exports.test = async ({ Person }) => {
  expect(await Person.find()).toMatchInlineSnapshot(`
    Array [
      Object {
        "__v": 0,
        "_id": "393761396433333065323336",
        "name": "Anna",
      },
    ]
  `);
};
