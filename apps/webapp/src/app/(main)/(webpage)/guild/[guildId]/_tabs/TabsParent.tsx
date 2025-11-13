import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/tabs";
import {
  Ban,
  Cake,
  LayoutDashboard,
  MailPlus,
  ScrollText,
  Settings,
  Target,
  UserCog,
} from "lucide-react";
import BirthdaysTab from "./birthdays";
import BingoTab from "./bingo";
import type { api } from "~/trpc/server";
import type { DiscordGuildMemberWithBirthday } from "@repo/validators";
import { Button } from "@repo/ui/button";
import Link from "next/link";

interface TabsParentProps {
  guildId: string;
  guildMembersWithBirthday: DiscordGuildMemberWithBirthday[];
  birthdays: Awaited<ReturnType<typeof api.birthday.getGuildBirthdays>>;
  children: React.ReactNode;
}
const TabsParent = ({
  guildId,
  guildMembersWithBirthday,
  birthdays,
  children,
}: TabsParentProps) => {
  return (
    <Tabs defaultValue="verification" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="overview" disabled>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="birthdays">
          <Link
            href={`/guild/${guildId}/birthdays`}
            className="flex flex-row items-center"
          >
            <Cake className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Birthdays</span>
          </Link>
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
          <Link
            href={`/guild/${guildId}/bingo`}
            className="flex flex-row items-center"
          >
            <Target className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Bingo</span>
          </Link>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Guild Overview</h1>
          {/* Add guild overview content here */}
        </div>
      </TabsContent>
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
      {children}
    </Tabs>
  );
};

export default TabsParent;
