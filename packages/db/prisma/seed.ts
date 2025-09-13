import { runQuery as runQueryBingo } from "../src/seed/Bingo";

async function main() {
  console.log("Seeding database...");

  // Run the birthday seed query
  // await runQueryBirthday();

  await runQueryBingo();

  console.log("Database seeded successfully.");
}
main().catch(async (e) => {
  console.error(e);
});
