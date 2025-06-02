import mongoose, { Schema, model } from "mongoose";

export interface IUser {
  discordId: string;
  _id: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IUser>(
  {
    discordId: {
      type: String,
      unique: true,
    },
    displayName: {
      type: String,
      default: "Unknown user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models?.User || model<IUser>("User", schema);
export default User;
