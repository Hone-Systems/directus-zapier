require("dotenv").config(); // Load environment variables from .env
const zapier = require("zapier-platform-core");

// Use TDD (Test Driven Development) approach: http://docs.zapier.com/cli_testing/tdd/
// Specifically: https://github.com/zapier/zapier-platform-cli#testing use `npm run test` to run.

// We recommend writing your tests before you write the methods!
// These are integration tests - they connect to a live Directus API instance defined in .env
// to ensure the authentication methods work as expected.

const App = require("../index");
const appTester = zapier.createAppTester(App);

zapier.tools.env.inject(); // Inject environment variables like DIRECTUS_URL and ACCESS_TOKEN

describe("Directus Authentication", () => {
    it("should authenticate successfully with valid credentials", async () => {
        // Arrange: Prepare the bundle with credentials from .env
        const bundle = {
            authData: {
                directus_url: process.env.DIRECTUS_URL,
                access_token: process.env.ACCESS_TOKEN
            }
        };

        // Act: Call the authentication test method
        const result = await appTester(App.authentication.test, bundle);

        // Assert: Check if the authentication was successful
        // The test method returns { success: true } upon successful authentication
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
    });

    it("should fail authentication with invalid credentials", async () => {
        // Arrange: Prepare the bundle with deliberately wrong credentials
        const bundle = {
            authData: {
                directus_url: process.env.DIRECTUS_URL,
                access_token: "invalid-token" // Use an incorrect token
            }
        };

        // Act & Assert: Expect the test method to throw an error
        try {
            await appTester(App.authentication.test, bundle);
            // If the above line doesn't throw, the test should fail
            fail("Authentication test should have failed with invalid credentials");
        } catch (error) {
            // Assert: Check if the error message indicates authentication failure
            expect(error).toBeDefined();
            // Depending on the exact error Directus returns, you might need to adjust this check
            // The current authentication.js throws a generic error, but Zapier wraps it.
            // Check for the actual API error message within the wrapped error.
            expect(error.message).toContain("Invalid user credentials");
        }
    });
});
