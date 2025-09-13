import TabsParent from "./_tabs/TabsParent";
import { api } from "~/trpc/server";

interface GuildLayoutProps {
  children: React.ReactNode;
  params: {
    guildId: string;
  };
}
const GuildLayout = async ({ children, params }: GuildLayoutProps) => {
  const { guildId } = await params;
  const [guildMembersWithBirthday, birthdays] = await Promise.all([
    api.discord.getGuildMembersWithBirthday({ guildId }),
    api.birthday.getGuildBirthdays({ guildId }),
  ]);

  return (
    <TabsParent
      guildId={guildId}
      guildMembersWithBirthday={guildMembersWithBirthday}
      birthdays={birthdays}
    >
      {children}
    </TabsParent>
  );
};

export default GuildLayout;
