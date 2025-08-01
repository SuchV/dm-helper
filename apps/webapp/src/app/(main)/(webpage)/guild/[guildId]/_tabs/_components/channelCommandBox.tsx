import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@spolka-z-l-o/ui/command";

import type { APIGuildChannel } from "@spolka-z-l-o/validators";
import { ChannelType } from "@spolka-z-l-o/validators";

export const ChannelCommandBox = ({
  guildChannels,
  onSelect,
}: {
  guildChannels: APIGuildChannel<ChannelType.GuildText>[];
  onSelect: (value: string) => void;
}) => {
  return (
    <Command>
      <CommandInput placeholder="Search for guild channels..." />
      <CommandList>
        <CommandEmpty>No channels found.</CommandEmpty>
        <CommandGroup heading="Members">
          {guildChannels.map((channel) => (
            <CommandItem
              key={channel.id}
              value={channel.id}
              className="cursor-pointer"
              onSelect={(value) => {
                onSelect(value);
              }}
            >
              {channel.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
