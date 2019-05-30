import { TwitchIrcBot } from "./lib/twitch";
import { appConfig } from "./app-config";
import registerEmoteCount from "./commands/emotecount";
import registerTrivia from "./commands/trivia";

const bot = new TwitchIrcBot()

bot
  .on("connect")
  .subscribe(async () => {
    await bot.login(appConfig.nick, appConfig.pass)
    await bot.reqCap("commands")
    await bot.reqCap("membership")
    await bot.reqCap("tags")
    await Promise.all(
      appConfig.channels
        .map(chn => bot.join(chn))
    )
  })

bot.connect()

bot.command(/^miniDank$/)
  .subscribe(req => req.send("pajaDank 🎺 doot"))

bot.command(/^pajaDank$/)
  .subscribe(req => req.send("miniDank 🎺 doot"))

registerEmoteCount(bot)
registerTrivia(bot)
