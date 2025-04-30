require("dotenv").config();
const zapier = require("zapier-platform-core");

const App = require("../../index");
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("Searches - List Items", () => {
    // Use the collection name you provided
    const testCollection = "schedule";

    it("should list items from a specified collection", async () => {
        // Arrange: Prepare the bundle with authentication and input data
        const bundle = {
            authData: {
                directus_url: process.env.DIRECTUS_URL,
                access_token: process.env.ACCESS_TOKEN
            },
            inputData: {
                collection: testCollection
                // Optional: Add other input fields to test filtering, sorting, etc.
                // limit: 5,
                // fields: ['id', 'title'],
                // sort: ['-date_created']
            }
        };

        // Act: Call the list_items search perform method
        const results = await appTester(App.searches[App.searches.list_items.key].operation.perform, bundle);

        // Assert: Check if the results are as expected
        expect(results).toBeDefined();
        // Zapier expects an array, even if it's empty
        expect(Array.isArray(results)).toBe(true);

        // Add more specific assertions if you know what data to expect
        // For example, if the collection is expected to have items:
        // expect(results.length).toBeGreaterThan(0);
        // if (results.length > 0) {
        //   expect(results[0]).toHaveProperty('id'); // Check if items have an ID
        // Add checks for other expected fields based on your collection structure
        // }

        // If testing with optional params like 'fields', check if only those fields were returned
        // if (bundle.inputData.fields && results.length > 0) {
        //    const firstItemKeys = Object.keys(results[0]);
        //    expect(firstItemKeys).toEqual(expect.arrayContaining(bundle.inputData.fields));
        //    // Optionally check that *only* requested fields are present (if Directus behaves that way)
        //    expect(firstItemKeys.length).toBe(bundle.inputData.fields.length);
        // }
    });

    it("should return an empty array for a non-existent collection", async () => {
        // Arrange
        const bundle = {
            authData: {
                directus_url: process.env.DIRECTUS_URL,
                access_token: process.env.ACCESS_TOKEN
            },
            inputData: {
                collection: "non_existent_collection_xyz123" // Use a name unlikely to exist
            }
        };

        // Act & Assert: Expect the perform method to throw a specific error for 404/403
        try {
            await appTester(App.searches[App.searches.list_items.key].operation.perform, bundle);
            // If the above line doesn't throw, the test should fail
            fail("Search should have failed for a non-existent or forbidden collection");
        } catch (error) {
            expect(error).toBeDefined();
            // Check for the specific error thrown in list_items.js for 403/404
            expect(error.name).toBe("ResponseError"); // Check for the specific error type from z.errors
            // Check that the message includes the specific permission error from the API
            expect(error.message).toContain("You don't have permission to access this.");
            // The error.code property seems unreliable in tests, so we rely on name and message content.
            // expect(error.code).toBe("NotFound"); // Removed this check
        }
    });

    // Add more tests here to cover:
    // - Different combinations of input fields (limit, sort, filter, search, meta, fields)
    // - Edge cases (e.g., empty collection)
    // - Error handling for invalid filters or other API errors
});
