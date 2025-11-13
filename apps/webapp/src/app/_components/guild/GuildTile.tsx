import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import type { DiscordUserGuild } from "@repo/validators/discord";
import Image from "next/image";
import Link from "next/link";
import { getBotInviteLink, getNameShort } from "../helpers";
import BlurredTile from "../BlurredTile";
import { Button } from "@repo/ui/button";

interface GuildTileProps {
  guild: DiscordUserGuild;
  isBotPresent: boolean;
}

const GuildTile = ({ guild, isBotPresent }: GuildTileProps) => {
  let tileURL = `/guild/${guild.id}`;
  if (!isBotPresent) {
    tileURL = getBotInviteLink();
  }
  return (
    <Link href={tileURL} className="flex flex-col items-center gap-2">
      <BlurredTile
        backgroundImage={
          guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : undefined
        }
        backgroundColor={"bg-background-secondary"}
        className="h-32"
      >
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
            className="border-white rounded-full border-2"
          />
          <AvatarFallback>{getNameShort(guild.name)}</AvatarFallback>
        </Avatar>
      </BlurredTile>
      <div className="flex h-12 w-full items-center justify-between p-2">
        <span className="text-xs font-semibold">{guild.name}</span>
        {isBotPresent ? (
          <Button type="button" variant="primary">
            Go
          </Button>
        ) : (
          <Button type="button" variant="secondary">
            Setup
          </Button>
        )}
      </div>
    </Link>
  );
};

export default GuildTile;
