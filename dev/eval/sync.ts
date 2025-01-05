async function asyncFunction(): Promise<number> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(42);
        }, 1000);
    });
}

async function syncBehaviorExample() {
    const result = await asyncFunction();  // Wait for the async function to resolve
    return result;  // Output: 42 (after 1 second)
}

const result_ = syncBehaviorExample();
console.log(result_);
