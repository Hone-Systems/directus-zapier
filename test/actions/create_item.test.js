require("dotenv").config();
const zapier = require("zapier-platform-core");

const App = require("../../index");
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe("Creates - Create Item", () => {
    const testCollection = "schedule";

    it("should create an item in a specified collection", async () => {
        const bundle = {
            authData: {
                directus_url: process.env.DIRECTUS_URL,
                access_token: process.env.ACCESS_TOKEN
            },
            inputData: {
                collection: testCollection,
                itemData: {
                    title: "Test Item Created by Zapier",
                    status: "draft"
                }
            }
        };

        const result = await appTester(App.creates[App.creates.create_item.key].operation.perform, bundle);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(Array.isArray(result)).toBe(false);

        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title", "Test Item Created by Zapier");
        expect(result).toHaveProperty("status", "draft");
    });

    it("should return an error for a non-existent collection", async () => {
        const bundle = {
            authData: {
                directus_url: process.env.DIRECTUS_URL,
                access_token: process.env.ACCESS_TOKEN
            },
            inputData: {
                collection: "non_existent_collection_xyz123", // Use a name unlikely to exist
                itemData: {
                    title: "This Should Fail",
                    status: "draft"
                }
            }
        };

        try {
            await appTester(App.creates[App.creates.create_item.key].operation.perform, bundle);
            fail("Create should have failed for a non-existent or forbidden collection");
        } catch (error) {
            expect(error).toBeDefined();
            expect(error.name).toBe("ResponseError"); // Check for the specific error type from z.errors
            expect(error.message).toContain("You don't have permission to access this.");
        }
    });

});
