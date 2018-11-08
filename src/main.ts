import { IrcBot } from "./lib/twitch/bot";
import { appConfig } from "./config";

const bot = new IrcBot()

bot.on("connect").subscribe(() => {
  bot.login(appConfig().nick, appConfig().pass)
  bot.reqCap("commands")
  bot.reqCap("membership")
  bot.reqCap("tags")
  bot.join("forsen")
})

bot.command(/^miniDank$/).subscribe(req => req.send("pajaDank 🎺 doot"))
bot.command(/^pajaDank$/).subscribe(req => req.send("miniDank 🎺 doot"))

bot.connect()
