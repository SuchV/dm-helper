import { Collection } from "discord.js";

export class CooldownCollection {
  private _cooldowns: Collection<string, Map<string, number>>;

  constructor() {
    this._cooldowns = new Collection();
  }

  public has(commandName: string): boolean {
    return this._cooldowns.has(commandName);
  }

  public get(commandName: string): Map<string, number> | undefined {
    return this._cooldowns.get(commandName);
  }

  public set(commandName: string, cooldownMap: Map<string, number>): void {
    this._cooldowns.set(commandName, cooldownMap);
  }

  public is_user_on_cooldown(commandName: string, userId: string): boolean {
    const commandCooldownCollection = this.get(commandName);
    if (!commandCooldownCollection) {
      console.log("!commandCooldownCollection", commandName, userId);
      return false;
    }
    const userCooldown = commandCooldownCollection.get(userId);
    if (!userCooldown) {
      console.log("!userCooldown", commandName, userId);
      return false;
    }
    const now = Date.now();
    return now < userCooldown;
  }

  public set_user_cooldown(
    commandName: string,
    userId: string,
    cooldown: number
  ) {
    const commandCooldownCollection =
      this._cooldowns.get(commandName) || new Collection();
    const cooldownEnd = Date.now() + cooldown * 1000;
    commandCooldownCollection.set(userId, cooldownEnd);
    this._cooldowns.set(commandName, commandCooldownCollection);
  }
}
