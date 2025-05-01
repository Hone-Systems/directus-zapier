const perform = async (z, bundle) => {
    const options = {
        url: `${bundle.authData.directus_url}/items/${bundle.inputData.collection}`,
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        params: {
            access_token: bundle.authData.access_token
        },
        body: bundle.inputData.itemData
    };

    const response = await z.request(options);

    if (response.status === 200 || response.status === 201) {
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
        label: "Create Item",
        description: "Creates a new item in a specified collection."
    },

    operation: {
        perform,

        inputFields: [
            {
                key: "collection",
                required: true,
                helpText: "The unique name (slug) of the collection to create an item in."
            },
            {
                key: "itemData",
                label: "Item Data",
                required: true,
                dict: true,
                helpText: "The data for the new item. Specify field names and values."
            }
        ],

        sample: {
            id: 1,
            status: "published",
            title: "Example Item"
        },

        outputFields: [
            { key: "id", label: "Item ID", type: "integer" },
            { key: "status" },
            { key: "title" }
        ]
    }
};
