function evaluateAndReturn(dynamicCode: string): any {
    return eval(dynamicCode);
}

const dynamicSource = `
const test = "test";
test`
    ;

const result = evaluateAndReturn(dynamicSource);
console.log(result);
