import { IrcBot } from "./lib/twitch/bot";
import { appConfig } from "./config";
import registerEmoteCount from "./commands/emotecount";
import registerTrivia from "./commands/trivia";

const bot = new IrcBot()

bot.on("connect").subscribe(() => {
  bot.login(appConfig().nick, appConfig().pass)
  bot.reqCap("commands")
  bot.reqCap("membership")
  bot.reqCap("tags")
  
  appConfig().channels.forEach(chn => bot.join(chn))
})

bot.on("unknown").subscribe(xd => console.log(xd.line))

bot.connect()

bot.command(/^miniDank$/).subscribe(req => req.send("pajaDank 🎺 doot"))
bot.command(/^pajaDank$/).subscribe(req => req.send("miniDank 🎺 doot"))

registerEmoteCount(bot)
registerTrivia(bot)
