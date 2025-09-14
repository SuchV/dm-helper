import { Avatar, AvatarFallback, AvatarImage } from "@spolka-z-l-o/ui/avatar";
import { Skeleton } from "@spolka-z-l-o/ui/skeleton";
import { TabsContent } from "@spolka-z-l-o/ui/tabs";
import type { DiscordGuildMemberWithBirthday } from "@spolka-z-l-o/validators";
import MemberCommandBox from "~/app/_components/main/MemberCommandBox";
import { api } from "~/trpc/server";

interface BirthdaysTabProps {
  guildId: string;
  guildMembersWithBirthday: DiscordGuildMemberWithBirthday[];
  birthdays: Awaited<ReturnType<typeof api.birthday.getGuildBirthdays>>;
}

const BirthdaysTab = ({
  guildId,
  guildMembersWithBirthday,
  birthdays,
}: BirthdaysTabProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight
  const todayBirthdays = birthdays.filter((birthday) => {
    const birthdayDate = new Date(birthday.birthday_date);
    return (
      birthdayDate.getMonth() === today.getMonth() &&
      birthdayDate.getDate() === today.getDate()
    );
  });
  const pastBirthdays = birthdays.filter((birthday) => {
    const birthdayDate = new Date(birthday.birthday_date);
    birthdayDate.setHours(0, 0, 0, 0); // Normalize to midnight
    const daysDifference =
      (today.getTime() - birthdayDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDifference <= 14 && daysDifference > 0;
  });
  const futureBirthdays = birthdays.filter((birthday) => {
    const birthdayDate = new Date(birthday.birthday_date);
    birthdayDate.setHours(0, 0, 0, 0); // Normalize to midnight
    const daysDifference =
      (birthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysDifference <= 14 && daysDifference > 0;
  });
  return (
    <TabsContent value="birthdays">
      <div className="flex w-full flex-row justify-stretch gap-4 p-4">
        <div>
          <MemberCommandBox
            membersWithBirthday={guildMembersWithBirthday}
            guildId={guildId}
          />
        </div>
        <div>
          <h2 className="mt-4">Recent birthdays:</h2>
          {pastBirthdays.length > 0 ? (
            <div>
              {pastBirthdays.map((birthday) => {
                const userName = birthday.account.user.name || "Unknown User";
                const birthdayDate = new Date(birthday.birthday_date);
                return (
                  <div
                    key={birthday.id}
                    className="bg-white mb-2 flex items-center gap-4 rounded p-2 shadow"
                  >
                    {!birthday ? (
                      <Skeleton />
                    ) : (
                      <Avatar>
                        <AvatarFallback>No image found!</AvatarFallback>
                        <AvatarImage
                          src={birthday.account.user.image ?? ""}
                          alt={birthday.providerAccountId}
                        />
                      </Avatar>
                    )}
                    <span>
                      {userName} - {birthdayDate.toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No recent birthdays.</p>
          )}
          <h2>Today birthdays:</h2>
          {todayBirthdays.length > 0 ? (
            <div>
              {todayBirthdays.map((birthday) => {
                const userName = birthday.account.user.name || "Unknown User";

                return (
                  <div
                    key={birthday.id}
                    className="bg-white mb-2 flex items-center gap-4 rounded p-2 shadow"
                  >
                    {!birthday ? (
                      <Skeleton />
                    ) : (
                      <Avatar>
                        <AvatarFallback>No image found!</AvatarFallback>
                        <AvatarImage
                          src={birthday.account.user.image ?? ""}
                          alt={birthday.providerAccountId}
                        />
                      </Avatar>
                    )}
                    <span>{userName}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No birthdays today.</p>
          )}
          <h2 className="mt-4">Upcoming birthdays:</h2>
          {futureBirthdays.length > 0 ? (
            <div>
              {futureBirthdays.map((birthday) => {
                const userName = birthday.account.user.name || "Unknown User";
                const birthdayDate = new Date(birthday.birthday_date);
                return (
                  <div
                    key={birthday.id}
                    className="bg-white mb-2 flex items-center gap-4 rounded p-2 shadow"
                  >
                    {!birthday ? (
                      <Skeleton />
                    ) : (
                      <Avatar>
                        <AvatarFallback>No image found!</AvatarFallback>
                        <AvatarImage
                          src={birthday.account.user.image ?? ""}
                          alt={birthday.providerAccountId}
                        />
                      </Avatar>
                    )}
                    <span>
                      {userName} - {birthdayDate.toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No upcoming birthdays.</p>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default BirthdaysTab;
