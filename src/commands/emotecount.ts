import { IrcBot, CommandRequest } from "../lib/twitch";
import axios from "axios";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

async function genericEmoteCount(req: CommandRequest, emotes: RegExp, returnmsg: string, plus: number) {
  const date = req.match[2 + plus] ? new Date(parseInt("20" + req.match[3 + plus]), parseInt(req.match[2 + plus]) - 1) : new Date()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  let name = req.match[1 + plus] ? req.match[1 + plus] : req.usr

  try {
    const uri = `https://overrustlelogs.net/${req.chn}%20chatlog/${month}%20${year}/userlogs/${name}.txt`
    const res = await axios.get(uri)
    const count = (res.data.match(emotes) || []).length
    const typed = `typed ${count} ${returnmsg} in ${month} ${year}`

    if (name === req.usr) {
      name = "you"
    }

    req.reply(`${name} ${typed}`)
  } catch (err) {
    req.reply(`${err}`)
  }
}

async function genericMaxEmoteCount(req: CommandRequest, emotes: RegExp, returnmsg: string) {
  let date = new Date()
  let month = monthNames[date.getMonth()]
  let year = date.getFullYear()
  let maxCount = 0
  let maxMonth = ""
  let maxYear = 0

  try {
    while (true) {
      const uri = `https://overrustlelogs.net/${req.chn}%20chatlog/${month}%20${year}/userlogs/${req.usr}.txt`
      const res = await axios.get<string>(uri)
      const count = (res.data.match(emotes) || []).length

      if (count > maxCount) {
        maxCount = count
        maxMonth = month
        maxYear = year
      }

      if (date.getMonth() === 0) {
        date = new Date(date.getFullYear() - 1, 11)
      } else {
        date = new Date(date.getFullYear(), date.getMonth() - 1)
      }

      month = monthNames[date.getMonth()]
      year = date.getFullYear()
    }
  } catch (err) {
    req.reply(`you typed the most ${returnmsg} in ${maxMonth} ${maxYear} with ${maxCount} ${returnmsg}`)
  }
}

function registerCommand(bot: IrcBot, name: string, emotes: RegExp, returnmsg: string) {
  bot.command(new RegExp(`^!${name}(?: ([^\\d\\W]+)|)(?: (\\d+)\.(\\d+)|)`)).subscribe(req => {
    genericEmoteCount(req, emotes, returnmsg, 0)
  })

  bot.command(new RegExp(`^!max${name}`)).subscribe(req => {
    genericMaxEmoteCount(req, emotes, returnmsg)
  })
}

export default function register(bot: IrcBot) {
  registerCommand(bot, "beecount", /BBona|BBaper|bUrself|HONEYDETECTED|forsenBee|🐝|whykinBee|whykinG|pajaBee|nymnBee/g, "bees")
  registerCommand(bot, "dankcount", /pajaDank|miniDank|FeelsDankMan/g, "dank emotes")
  registerCommand(bot, "gachicount2", /gachiHYPER|gachiGASM|HandsUp|gachiSANTA|forsenSleeper|gachiBASS|gachiPRIDE|gachiGAZUMU|GachiPls|pajaGASM/g, "gachi emotes")
  registerCommand(bot, "namcount", /NaM/g, "nams")
  registerCommand(bot, "kkonacount", /KKona|KKonaw|KKaper|KKool/g, "kool emotes")
  registerCommand(bot, "pajcount", /pajaCmon|pajaCool|pajaDank|pajaDog|pajaDuck|pajaGASM|pajaH|pajaHappy|pajaKek|pajaL|pajaPepe|pajaR|pajaS|pajaVan|pajaW|pajaXD|pajaCMON/g, "paj emotes")
}
