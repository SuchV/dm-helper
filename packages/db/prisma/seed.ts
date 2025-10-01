import { runQuery as runQueryBingo } from "../src/seed/Bingo";
import { runQuery as runQueryAccount } from "../src/seed/Account";

async function main() {
  console.log("Seeding database...");

  await runQueryAccount();

  // Run the birthday seed query
  // await runQueryBirthday();

  // await runQueryBingo();

  console.log("Database seeded successfully.");
}
main().catch(async (e) => {
  console.error(e);
});
