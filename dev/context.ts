const context = [{ "foo": 1, "bar": "foo" }];

const source = `<NavTree children='${JSON.stringify(context)}'`;

console.log(source);
