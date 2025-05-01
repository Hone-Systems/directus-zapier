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
                    schedule: { name: "Test Schedule Created by Zapier" },
                    week_number: 1,
                    partner: null // Using null since we don't have a valid UUID
                }
            }
        };

        const result = await appTester(App.creates[App.creates.create_item.key].operation.perform, bundle);

        expect(result).toBeDefined();
        expect(result).toHaveProperty("id"); // Created items should have an ID
        expect(result).toHaveProperty("date_created"); // Should have a creation date
        expect(result).toHaveProperty("schedule"); // Should have a schedule object
        if (Object.keys(result.schedule).length > 0) {
            expect(result.schedule).toEqual(bundle.inputData.itemData.schedule);
        }
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
                    schedule: { name: "Test Non-existent Collection" },
                    week_number: 1,
                    partner: null // Using null since we don't have a valid UUID
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
