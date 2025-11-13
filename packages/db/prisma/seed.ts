import { runQuery as runQueryBingo } from "../src/seed/Bingo";
import { runQuery as runQueryAccount } from "../src/seed/Account";
import { clearDb } from "../src/seed/utils";

async function main() {
  console.log("Seeding database...");

  await clearDb();

  console.log("Database cleared.");

  await runQueryAccount();

  // Run the birthday seed query
  // await runQueryBirthday();

  await runQueryBingo();

  console.log("Database seeded successfully.");
}
main().catch(async (e) => {
  console.error(e);
});
