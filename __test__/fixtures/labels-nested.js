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
        primary: true
      }
    }
  }
});

exports.test = async ({ Person }) => {
  expect(Person.getLabel("name.first")).toMatchInlineSnapshot(`"First Name"`);
  expect(Person.getLabel("name.last")).toMatchInlineSnapshot(`"Last Name"`);
  expect(Person.getLabel("name.full")).toMatchInlineSnapshot(`"Name"`);
};
