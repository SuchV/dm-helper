import { Client } from "discord.js";
import { CooldownCollection } from "./cooldown-checker";

export class CustomClient extends Client {
  private _cooldowns: CooldownCollection;

  constructor(options: any) {
    super(options);
    this._cooldowns = new CooldownCollection();
  }

  get cooldowns() {
    return this._cooldowns;
  }
}
