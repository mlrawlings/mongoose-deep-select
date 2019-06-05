exports.schemas = () => ({
  Person: {
    name: {
      type: String,
      label: "Name",
      primary: true
    }
  }
});

exports.test = async ({ Person }) => {
  expect(Person.getLabel("name")).toMatchInlineSnapshot(`"Name"`);
};
