import { api } from "~/trpc/server";
import BirthdaysTab from "../_tabs/birthdays";

interface BirthdaysPageProps {
  params: {
    guildId: string;
  };
}

const BirthdaysPage = async ({ params }: BirthdaysPageProps) => {
  const { guildId } = params;
  const [guildMembersWithBirthday, guild, birthdays] = await Promise.all([
    api.discord.getGuildMembersWithBirthday({ guildId }),
    api.discord.getGuildDetails({ guildId }),
    api.birthday.getGuildBirthdays({ guildId }),
  ]);
  return (
    <BirthdaysTab
      guildId={guildId}
      guildMembersWithBirthday={guildMembersWithBirthday}
      birthdays={birthdays}
    />
  );
};

export default BirthdaysPage;
