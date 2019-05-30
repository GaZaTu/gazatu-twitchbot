import * as path from "path";
import { readFileSync } from "fs";

interface AppConfigInput {
  production?: boolean
  nick: string
  pass: string
  channels?: string[]
}

export const appConfig = (() => {
  const configPath = path.join(__dirname, "/../config.json")
  const rawInput = readFileSync(configPath).toString()
  const input = JSON.parse(rawInput) as AppConfigInput
  const production = (input.production !== undefined) ? input.production : (process.env.NODE_ENV === "production")

  return {
    production: production,
    nick: input.nick,
    pass: input.pass,
    channels: input.channels || [],
  }
})()
