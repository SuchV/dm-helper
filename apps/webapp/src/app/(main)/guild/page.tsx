import { api } from "~/trpc/server";

const GuildPage = async () => {
  //   const guilds = await api.discord.adminGuilds({
  //     access_token: "NzA1OTA2MzY0MDY0NDY0OTI3.c2QlSJtSoeN5Zz02fH0cl8RLhiVGFS",
  //   });
  //   console.log(guilds);
  const a = await api.user.profile();
  console.log({ a });
  return <div>Please choose a guild you'd like to make some changes to.</div>;
};

export default GuildPage;
