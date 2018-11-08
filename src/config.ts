import * as path from "path";
import { readFileSync } from "fs";

interface AppConfigInput {
  production?: boolean
  nick: string
  pass: string
}

interface AppConfig {
  production: boolean
  nick: string
  pass: string
}

const configPath = path.join(__dirname, "/../config.json")
let config: AppConfig | null = null

export function appConfig() {
  if (!config) {
    const rawInput = readFileSync(configPath).toString()
    const input = JSON.parse(rawInput) as AppConfigInput
    const production = (input.production !== undefined) ? input.production : (process.env.NODE_ENV === "production")

    config = {
      production: production,
      nick: input.nick,
      pass: input.pass,
    }
  }

  return config
}
