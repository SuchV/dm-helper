import { runQuery as runQueryBirthday } from "../src/seed/Birthday";

async function main() {
  console.log("Seeding database...");

  // Run the birthday seed query
  await runQueryBirthday();

  console.log("Database seeded successfully.");
}
main().catch(async (e) => {
  console.error(e);
});
