const authentication = {
    type: "custom",
    // Define the fields needed for authentication. Zapier shows these to the user.
    fields: [
        {
            key: "directus_url",
            label: "Directus Base URL",
            helpText: "Enter the base URL of your Directus instance, e.g., https://your-instance.directus.app",
            required: true,
            type: "string"
        },
        {
            key: "access_token",
            label: "Static Access Token",
            helpText:
                "Enter your Directus static access token. You can create one in Settings -> Data Model -> Your User -> Token.",
            required: true,
            type: "password" // Use 'password' type to mask the token in Zapier UI
        }
    ],
    // Define a test function to verify the credentials work.
    // Zapier runs this when a user connects their account.
    test: (z, bundle) => {
        // Make a request to a protected endpoint to test authentication.
        // '/users/me' is a common endpoint that requires authentication.
        const promise = z.request({
            url: `${bundle.authData.directus_url}/users/me`,
            params: {
                access_token: bundle.authData.access_token
            }
        });

        return promise.then((response) => {
            if (response.status !== 200) {
                throw new Error(`Authentication failed: ${response.content}`);
            }
            // If the request is successful, return some data (or just an empty object)
            // to indicate success. Zapier doesn't strictly use this return value,
            // but it confirms the connection works.
            // We could potentially return user info here if needed later.
            z.console.log("Authentication successful!");
            return { success: true }; // Indicate success
        });
    },
    // Define how the auth data is used in subsequent API calls.
    // Here, we'll just pass it through, and the perform methods will extract it.
    // Alternatively, we could use connectionLabel to show user-friendly connection info.
    connectionLabel: (z, bundle) => {
        // You can customize this label, e.g., show the Directus URL or user info
        // For now, just showing the URL.
        return bundle.authData.directus_url;
    }
};

module.exports = authentication;
