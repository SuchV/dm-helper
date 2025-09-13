import { api } from "~/trpc/server";

import TabsParent from "./_tabs/TabsParent";
import { redirect } from "next/navigation";

interface GuildPageProps {
  params: {
    guildId: string;
  };
}

const GuildPage = async ({ params }: GuildPageProps) => {
  const { guildId } = await params;

  // const [guildMembersWithBirthday, guild, birthdays] = await Promise.all([
  //   api.discord.getGuildMembersWithBirthday({ guildId }),
  //   api.discord.getGuildDetails({ guildId }),
  //   api.birthday.getGuildBirthdays({ guildId }),
  // ]);

  redirect(`/guild/${guildId}/birthdays`);

  // return (
  //   <div>
  //     <TabsParent
  //       guildId={guildId}
  //       guildMembersWithBirthday={guildMembersWithBirthday}
  //       birthdays={birthdays}
  //     />
  //   </div>
  // );
};

export default GuildPage;
