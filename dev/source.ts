
    return async function() {
        // Imports
        //
        const { mapCustomTags } = await import('./mapper.ts');
        // Constants
        //
        const customTags = {};
        //
        
            // Injected Context
            const Squirrel = {"Props":{"id":"123"}};
            // Code
            const { id } = Squirrel.Props;
        //
        const html_ = `<div id="${id}"><slot /></div>`;
        if (Object.keys(customTags).length) {
            return await mapCustomTags(customTags, html_);
        }

        return html_;
    }