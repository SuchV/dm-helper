import { Schema, model } from "mongoose";
import { IRoleGroup } from "./RoleGroup";

export interface IVerification {
  guildId: string;
  channelId: string;
  messageId: string;
  requiredRoleGroups: IRoleGroup[];
  verifiedRole: string;
  unverifiedRole: string;
  confirmEmoji: string;
}

const schema = new Schema<IVerification>(
  {
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    requiredRoleGroups: [
      { type: Schema.Types.ObjectId, ref: "RoleGroup", required: true },
    ],
    verifiedRole: { type: String, required: true },
    unverifiedRole: { type: String, required: true },
    confirmEmoji: { type: String, required: true },
  },
  { timestamps: true }
);

export const Verification = model<IVerification>("Verification", schema);
