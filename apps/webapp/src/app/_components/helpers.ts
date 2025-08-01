import { env } from "@spolka-z-l-o/env/next-env";

export const getNameShort = (name: string) => {
  if (!name) return "";
  const parts = name
    .split(" ")
    .filter((part) => !!part)
    .map((part) => part + "??");
  if (parts.length === 1) {
    return parts[0]?.substring(0, 1).toUpperCase() ?? "??";
  }
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (
      parts[0]?.charAt(0).toUpperCase() + parts[1]?.charAt(0).toUpperCase()
    );
  }
  return "??";
};

export const getBotInviteLink = () => {
  return env.NEXT_PUBLIC_DISCORD_INVITE_URL;
};
