import { APIGuildMember } from "discord-api-types/v10";

export const guildMembersArray = [
  {
    nick: "Member",
    avatar: "",
    user: {
      id: "1",
      username: "Member",
      discriminator: "234",
      global_name: "MemberG",
      avatar: "",
    },
  },
  {
    nick: "Second",
    avatar: "",
    user: {
      id: "2",
      username: "Second",
      discriminator: "111",
      global_name: "SecondG",
      avatar: "",
    },
  },
] satisfies Partial<APIGuildMember>[];
