import { Button } from "@spolka-z-l-o/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@spolka-z-l-o/ui/tabs";
import { api } from "~/trpc/server";
import MemberCommandBox from "~/app/_components/main/MemberCommandBox";
import { Avatar, AvatarFallback, AvatarImage } from "@spolka-z-l-o/ui/avatar";
import { Skeleton } from "@spolka-z-l-o/ui/skeleton";
import { use } from "react";

import {
  LayoutDashboard,
  Cake,
  Settings,
  ScrollText,
  Ban,
  MailPlus,
  UserCog,
  Target,
} from "lucide-react";
import BirthdaysTab from "./_tabs/birthdays";
import BingoTab from "./_tabs/bingo";

interface GuildPageProps {
  params: {
    guildId: string;
  };
}

const GuildPage = async ({ params }: GuildPageProps) => {
  const { guildId } = await params;

  const [guildMembersWithBirthday, guild, birthdays] = await Promise.all([
    api.discord.getGuildMembersWithBirthday({ guildId }),
    api.discord.getGuildDetails({ guildId }),
    api.birthday.getGuildBirthdays({ guildId }),
  ]);

  return (
    <div>
      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview" disabled>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="birthdays">
            <Cake className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Birthdays</span>
          </TabsTrigger>
          <TabsTrigger value="settings" disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="logs" disabled>
            <ScrollText className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="bans" disabled>
            <Ban className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Bans</span>
          </TabsTrigger>
          <TabsTrigger value="invites" disabled>
            <MailPlus className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Invites</span>
          </TabsTrigger>
          <TabsTrigger value="roles" disabled>
            <UserCog className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="bingo">
            <Target className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Bingo</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Guild Overview</h1>
            {/* Add guild overview content here */}
          </div>
        </TabsContent>
        <BirthdaysTab
          guildId={guildId}
          guildMembersWithBirthday={guildMembersWithBirthday}
          birthdays={birthdays}
        />
        <TabsContent value="settings">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Guild Settings</h1>
            {/* Add guild settings content here */}
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Guild Logs</h1>
            {/* Add guild logs content here */}
          </div>
        </TabsContent>
        <TabsContent value="bans">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Guild Bans</h1>
            {/* Add guild bans content here */}
          </div>
        </TabsContent>
        <TabsContent value="invites">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Guild Invites</h1>
            {/* Add guild invites content here */}
          </div>
        </TabsContent>
        <TabsContent value="roles">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Guild Roles</h1>
            {/* Add guild roles content here */}
          </div>
        </TabsContent>
        <BingoTab />
      </Tabs>
    </div>
  );
};

export default GuildPage;
