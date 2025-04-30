const perform = async (z, bundle) => {
    const options = {
        url: `${bundle.authData.directus_url}/items/${bundle.inputData.collection}`,
        method: "GET",
        headers: {
            Accept: "application/json"
        },
        params: {
            access_token: bundle.authData.access_token,
            // Add optional parameters only if they are provided
            ...(bundle.inputData.fields && { fields: bundle.inputData.fields.join(";") }), // BUG: Use semicolon instead of comma
            ...(bundle.inputData.limit && { limit: bundle.inputData.limit }),
            ...(bundle.inputData.offset && { offset: bundle.inputData.offset }),
            ...(bundle.inputData.meta && { meta: bundle.inputData.meta }),
            ...(bundle.inputData.sort && { sort: bundle.inputData.sort.join(",") }), // Directus expects CSV for sort
            ...(bundle.inputData.filter && { filter: bundle.inputData.filter }), // Assuming filter is a stringified JSON object
            ...(bundle.inputData.search && { search: bundle.inputData.search })
        }
    };

    const response = await z.request(options);

    // Directus nests the actual items array under the 'data' key.
    // Zapier expects an array of objects for searches.
    if (response.status === 200 && response.json && response.json.data) {
        return response.json.data;
    } else if (response.status === 401) {
        throw new z.errors.Error(
            "Authentication failed. Check your Access Token.",
            "AuthenticationError",
            response.status
        );
    } else if (response.status === 404 || response.status === 403) {
        // Extract the specific error message if possible, otherwise use a generic one
        let errorMessage = `Collection '${bundle.inputData.collection}' not found or access denied.`;
        try {
            const errorJson = typeof response.content === "string" ? JSON.parse(response.content) : response.content;
            if (errorJson && errorJson.errors && errorJson.errors[0] && errorJson.errors[0].message) {
                errorMessage = errorJson.errors[0].message; // Use the actual message from Directus
            }
        } catch (e) {
            // Ignore parsing errors, stick to the generic message
        }
        // Throw NotFound for Zapier consistency, but include the specific API message
        throw new z.errors.Error(errorMessage, "NotFound", response.status);
    } else {
        // Handle other potential errors
        throw new z.errors.Error(
            `Failed to list items. Status: ${response.status}, Message: ${response.content}`,
            "APIError",
            response.status
        );
    }
};

module.exports = {
    key: "list_items",
    noun: "Item",

    display: {
        label: "List Items in Collection",
        description: "Lists items in a specified Directus collection."
    },

    operation: {
        perform,

        // Define the input fields Zapier will show to the user.
        inputFields: [
            {
                key: "collection",
                label: "Collection Name",
                type: "string",
                required: true,
                helpText: "The unique name (slug) of the Directus collection to list items from."
            },
            // Optional fields based on the Directus API documentation
            {
                key: "fields",
                label: "Fields to Return",
                type: "string",
                list: true, // Allows user to input multiple strings
                required: false,
                helpText:
                    "Specify which fields to return for each item (comma-separated or one per line). Leave blank to return all fields."
            },
            {
                key: "limit",
                label: "Limit",
                type: "integer",
                required: false,
                helpText: "Maximum number of items to return."
            },
            {
                key: "offset",
                label: "Offset",
                type: "integer",
                required: false,
                helpText: "Number of items to skip before returning results."
            },
            {
                key: "meta",
                label: "Metadata",
                type: "string",
                required: false,
                helpText: "What metadata to return (e.g., total_count, filter_count). Leave blank for default."
            },
            {
                key: "sort",
                label: "Sort Fields",
                type: "string",
                list: true, // Allows user to input multiple strings
                required: false,
                helpText:
                    "Fields to sort by (comma-separated or one per line). Prefix with - for descending order (e.g., -date_created). Use ? for random."
            },
            {
                key: "filter",
                label: "Filter (JSON)",
                type: "text", // Use 'text' for potentially large JSON input
                required: false,
                helpText: "Directus filter rules (JSON object) to apply. See Directus docs for syntax."
            },
            {
                key: "search",
                label: "Search Query",
                type: "string",
                required: false,
                helpText: "Search term to filter items across their fields."
            }
        ],

        // Define sample data for Zapier's testing/UI purposes.
        sample: {
            // Provide a realistic example of a single item returned by the API
            id: 1,
            status: "published",
            title: "Example Item"
            // Add other fields relevant to a typical Directus item
        },

        // Define the output fields based on the sample.
        // Zapier uses this to help users map data in subsequent steps.
        outputFields: [
            // Reflect the fields in the sample data
            { key: "id", label: "Item ID", type: "integer" },
            { key: "status", label: "Status" },
            { key: "title", label: "Title" }
            // Add more output fields as needed based on typical collection structures
        ]
    }
};
