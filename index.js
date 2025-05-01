// Import the authentication configuration
const authentication = require("./authentication");
// Import the search action
const listItemsSearch = require("./searches/list_items");
// Import the create action
const createItemCreate = require("./creates/create_item");

module.exports = {
    // This is just shorthand to reference the installed dependencies you have.
    // Zapier will need to know these before we can upload.
    version: require("./package.json").version,
    platformVersion: require("zapier-platform-core").version,

    // Include the authentication configuration
    authentication: authentication,

    // If you want your trigger to show up, you better include it here!
    triggers: {},

    // If you want your searches to show up, you better include it here!
    searches: {
        // Register the list items search action
        [listItemsSearch.key]: listItemsSearch
    },

    // If you want your creates to show up, you better include it here!
    creates: {
        // Register the create item action
        [createItemCreate.key]: createItemCreate
    },

    resources: {}
};
