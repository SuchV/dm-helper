import { Client, Guild } from "discord.js";
import { Birthday, IBirthday } from "@spolka-z-l-o/db";
import { birthdateSchema } from "../validators/birthdate";
import { GuildSettings, IGuildSettings } from "@spolka-z-l-o/db";

export const mentionBirthdaysForGuild = async (
  client: Client<boolean>,
  guildBirthdays: IBirthday[],
  guildSettings: IGuildSettings,
  guild: Guild
) => {
  if (!guildBirthdays.length) {
    console.error("No birthdays found for the guild.");
    return false;
  }
  const guildId = guildBirthdays[0]?.guildId;
  if (!guildSettings || !guildSettings?.birthdayChannelId) {
    console.error(
      "Guild settings not found for guild:",
      guildId,
      "in mentionBirthday"
    );
    return false;
  }
  if (!guild) {
    console.error("Guild not found.");
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const birthdayChannelId = guildSettings.birthdayChannelId;

  const birthdayMembers = guildBirthdays
    .map((e) => e.userId)
    .sort((a, b) => a.localeCompare(b));
  const channel = await guild.channels.fetch(birthdayChannelId);
  if (!channel || !channel.isTextBased()) {
    console.error("Birthday channel not found or not a text channel.");
    return false;
  }

  const sendString = "<@" + birthdayMembers.slice(0, 10).join(">, <@") + ">";

  await channel.send({
    content: `Happy birthday to ${sendString} ${
      birthdayMembers.length > 10
        ? `and ${birthdayMembers.length - 10} others!`
        : "!"
    } 🎉🎂`,
  });

  const updateResult = await Birthday.updateMany(
    { guildId: guildId },
    { last_year_mentioned: currentYear }
  );
  if (!updateResult) {
    console.error(
      "Failed to update birthdays for guild:",
      guildId,
      "to: ",
      currentYear
    );
    return false;
  }
  return true;
};

export const setBirthdayRolesForGuild = async (
  client: Client<boolean>,
  guildBirthdays: IBirthday[],
  guildSettings: IGuildSettings,
  guild: Guild
) => {
  if (!guildBirthdays.length) {
    console.error("No birthdays found for the guild.");
    return false;
  }
  const guildId = guildBirthdays[0]?.guildId;
  if (!guildSettings) {
    console.error(
      "Guild settings not found for guild:",
      guildId,
      "in setBirthdayRolesForGuild"
    );
    return false;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-indexed
  const currentDay = now.getDate();

  const role = guild.roles.cache.get(guildSettings.birthdayRoleId ?? "");
  const roleColor = role?.color ?? "#FFFF00"; // Default color if not set
  const rolePosition = role?.position ?? guild.roles.cache.size - 2; // Default position if not set
  console.log("Setting birthday roles for guild:", guildId);
  if (role) {
    console.log("Is role!", role.name);
    await role.delete();
    console.log("delete role after");
  }
  const newRole = await guild.roles.create({
    name: `Birthday ${currentDay.toString().padStart(2, "0")}.${currentMonth
      .toString()
      .padStart(2, "0")}`,
    color: roleColor,
    reason: "Birthday role",
    hoist: true,
    position: rolePosition,
  });

  const birthdayRoleUpdate = await GuildSettings.updateOne(
    { guildId: guildId },
    { birthdayRoleId: newRole.id }
  );

  if (!birthdayRoleUpdate) {
    console.error("Failed to update birthday role in guild settings.");
    return false;
  }

  guildBirthdays.forEach(async (birthdayEntry) => {
    const member = await guild.members.fetch(birthdayEntry.userId);
    if (!member) {
      console.error("Member not found in the guild.");
      return false;
    }
    await member.roles.add(newRole);
  });
  return true;
};

export const birthdayMentionCronJob = async (client: Client<boolean>) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-indexed
  const currentDay = now.getDate();
  const currentYear = now.getFullYear();

  const pipeline = [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: "$birthday_date" }, currentDay] },
            { $eq: [{ $month: "$birthday_date" }, currentMonth] },
            { $ne: ["$last_year_mentioned", currentYear] },
          ],
        },
      },
    },
  ];

  const todayBirthdays = await Birthday.aggregate<IBirthday>(pipeline);

  console.log("Starting birthday mention cron job...");
  const birthdayGuildGrouped = todayBirthdays.reduce(
    (acc, birthdayEntry) => {
      if (!acc[birthdayEntry.guildId]) {
        acc[birthdayEntry.guildId] = [];
      }
      acc[birthdayEntry.guildId]?.push(birthdayEntry);
      return acc;
    },
    {} as Record<string, IBirthday[]>
  );
  const birthdayGuilds = Object.keys(birthdayGuildGrouped);

  const userIdsToUpdate: string[] = [];

  birthdayGuilds.forEach(async (guildId) => {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      console.error("Guild not found:", guildId);
      return;
    }
    const guildSettings = await GuildSettings.findOne<IGuildSettings>({
      guildId: guildId,
    });
    if (!guildSettings) {
      console.error(
        "Guild settings not found for guild:",
        guildId,
        "in birthdayMentionCronJob"
      );
      return;
    }
    console.log("Processing guild:", guildId);
    const roleResult = await setBirthdayRolesForGuild(
      client,
      birthdayGuildGrouped[guildId] ?? [],
      guildSettings,
      guild
    );
    const mentionResult = await mentionBirthdaysForGuild(
      client,
      birthdayGuildGrouped[guildId] ?? [],
      guildSettings,
      guild
    );
    if (!roleResult || !mentionResult) {
      console.error("Failed to set birthday roles or mention birthdays.");
      return;
    }
    userIdsToUpdate.push(
      ...(birthdayGuildGrouped[guildId] ?? []).map((e) => e.userId)
    );
  });
  const updateResult = await Birthday.updateMany(
    { userId: { $in: userIdsToUpdate } },
    { last_year_mentioned: currentYear }
  );
  if (!updateResult) {
    console.error("Failed to update last_year_mentioned for users.");
    return;
  }
};
