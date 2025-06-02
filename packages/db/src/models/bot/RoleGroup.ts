import { Schema, model } from "mongoose";

export interface IRoleGroup {
  guildId: string;
  name: string;
  rolesIdArray: string[];
}

const schema = new Schema<IRoleGroup>(
  {
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    rolesIdArray: { type: [String], required: true },
  },
  { timestamps: true }
);

schema.index({ guildId: 1, name: 1 }, { unique: true });

export const RoleGroup = model<IRoleGroup>("RoleGroup", schema);
