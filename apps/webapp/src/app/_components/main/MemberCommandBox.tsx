"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import type { DiscordGuildMemberWithBirthday } from "@repo/validators/discord";
import { getNameShort } from "../helpers";
import BirthdayModal from "../modals/birthday";

interface MemberCommandBoxProps {
  membersWithBirthday: DiscordGuildMemberWithBirthday[];
  guildId: string;
}

const MemberCommandBox = ({
  membersWithBirthday,
  guildId,
}: MemberCommandBoxProps) => {
  console.log("membersWithBirthday", membersWithBirthday);
  return (
    <Command>
      <CommandInput placeholder="Search for guild members..." />
      <CommandList>
        <CommandEmpty>No members found.</CommandEmpty>
        <CommandGroup heading="Members">
          {membersWithBirthday.map((memberWithBirthday) => (
            <BirthdayModal
              guildId={guildId}
              key={memberWithBirthday.user.id}
              memberWithBirthday={memberWithBirthday}
            />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default MemberCommandBox;
