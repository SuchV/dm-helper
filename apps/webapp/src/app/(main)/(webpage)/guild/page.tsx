import { api } from "~/trpc/server";
import { env } from "@spolka-z-l-o/env/next-env";
import { auth } from "@spolka-z-l-o/auth";
import { redirect } from "next/navigation";
import GuildBadge from "~/app/_components/guild/GuildTile";
import {
  MainContainer,
  MainContainerContent,
  MainContainerHeader,
} from "~/app/_components/main/MainContainer";
import GuildTile from "~/app/_components/guild/GuildTile";

const GuildPage = async () => {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const guilds = await api.discord.getDashboardGuilds();

  return (
    <MainContainer>
      <MainContainerHeader>
        <h1 className="text-2xl font-bold">Select a server</h1>
      </MainContainerHeader>
      <MainContainerContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {guilds.commonGuilds.map((guild) => (
            <GuildTile key={guild.id} guild={guild} isBotPresent={true} />
          ))}
          {guilds.otherGuilds.map((guild) => (
            <GuildTile key={guild.id} guild={guild} isBotPresent={false} />
          ))}
        </div>
      </MainContainerContent>
    </MainContainer>
  );
};

export default GuildPage;
