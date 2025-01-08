// Imports
//
// Cannot use import statement outside a module
import { mapCustomTags } from '../../lib/mapper.ts';

function foo() {
    // Constants
    //
    const customTags = {};
    //

    // Injected Context
    const Squirrel = { "Props": { "id": 123, "foo": "bar" } };
    // Code
    customTags["User"] = "./data/User.squirrel";
    const { id, foo } = Squirrel.props;
    //
    const html_ = `<User id="${id}">${foo}</User>`;
    if (Object.keys(customTags).length) {
        return mapCustomTags(customTags, html_, Squirrel);
    }

    return html_;
}
console.log(foo());
