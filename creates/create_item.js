const perform = async (z, bundle) => {
    const options = {
        url: `${bundle.authData.directus_url}/items/${bundle.inputData.collection}`,
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        params: {
            access_token: bundle.authData.access_token,
            ...(bundle.inputData.fields && { fields: bundle.inputData.fields.join(";") }),
            ...(bundle.inputData.meta && { meta: bundle.inputData.meta })
        },
        body: typeof bundle.inputData.itemData === 'string' 
            ? JSON.parse(bundle.inputData.itemData) 
            : bundle.inputData.itemData
    };

    const response = await z.request(options);
    
    z.console.log('API Response:', response.status, JSON.stringify(response.json));

    if (response.status === 200 && response.json && response.json.data) {
        z.console.log('Returning data:', JSON.stringify(response.json.data));
        return response.json.data;
    } else if (response.status === 401) {
        throw new z.errors.Error(
            "Authentication failed. Check your Access Token.",
            "AuthenticationError",
            response.status
        );
    } else if (response.status === 404 || response.status === 403) {
        let errorMessage = `Collection '${bundle.inputData.collection}' not found or access denied.`;
        try {
            const errorJson = typeof response.content === "string" ? JSON.parse(response.content) : response.content;
            if (errorJson && errorJson.errors && errorJson.errors[0] && errorJson.errors[0].message) {
                errorMessage = errorJson.errors[0].message; // Use the actual message from Directus
            }
        } catch (e) {
        }
        throw new z.errors.Error(errorMessage, "NotFound", response.status);
    } else {
        throw new z.errors.Error(
            `Failed to create item. Status: ${response.status}, Message: ${response.content}`,
            "APIError",
            response.status
        );
    }
};

module.exports = {
    key: "create_item",
    noun: "Item",

    display: {
        label: "Create Item in Collection",
        description: "Creates a new item in a specified Directus collection."
    },

    operation: {
        perform,

        inputFields: [
            {
                key: "collection",
                label: "Collection Name",
                type: "string",
                required: true,
                helpText: "The unique name (slug) of the Directus collection to create an item in."
            },
            {
                key: "itemData",
                label: "Item Data",
                type: "string",
                required: true,
                helpText: "The data for the new item in JSON format. Example: {\"title\": \"New Item\", \"status\": \"published\"}",
                altersDynamicFields: true
            },
            {
                key: "fields",
                label: "Fields to Return",
                type: "string",
                list: true, // Allows user to input multiple strings
                required: false,
                helpText:
                    "Specify which fields to return for the created item (comma-separated or one per line). Leave blank to return all fields."
            },
            {
                key: "meta",
                label: "Metadata",
                type: "string",
                required: false,
                helpText: "What metadata to return (e.g., total_count, filter_count). Leave blank for default."
            }
        ],

        sample: {
            id: "d40e98b6-b59f-45b9-aa00-0503b9e14d2c",
            date_created: "2025-05-01T00:22:28.542Z",
            schedule: { name: "Example Schedule" },
            week_number: 1,
            partner: "Example Partner"
        },

        outputFields: [
            { key: "id", label: "Item ID" },
            { key: "date_created", label: "Date Created" },
            { key: "schedule", label: "Schedule" },
            { key: "week_number", label: "Week Number", type: "integer" },
            { key: "partner", label: "Partner" }
        ]
    }
};
