import { IrcClient } from "./irc";
import { filter, map } from "rxjs/operators";
import { PrivmsgEvent } from "./data";

export class CommandRequest extends PrivmsgEvent {
  private _match: RegExpExecArray
  private _bot: IrcBot

  constructor(data: PrivmsgEvent, match: RegExpExecArray, bot: IrcBot) {
    super(data.usr, data.chn, data.msg, data.tags)

    this._match = match
    this._bot = bot
  }

  sendInsecure(msg: string) {
    this._bot.sendInsecure(this.chn, msg)
  }

  send(msg: string) {
    this._bot.send(this.chn, msg)
  }

  reply(msg: string) {
    this.send(`@${this.usr} ${msg}`)
  }

  whisper(msg: string) {
    this.send(`/w ${this.usr} ${msg}`)
  }

  get match() {
    return this._match
  }

  get bot() {
    return this._bot
  }
}

interface Controller {
  regexp: RegExp
  run: (req: CommandRequest) => any
}

export class IrcBot extends IrcClient {
  private _tsOfLastSend = Date.now()
  private _messagesInWait = 0

  sendInsecure(chn: string, msg: string) {
    const timeDiff = (Date.now() - this._tsOfLastSend)

    if (timeDiff < 1600) {
      if (this._messagesInWait > 4) {
        return
      }

      this._messagesInWait++

      setTimeout(() => {
        this._messagesInWait--
        this.sendInsecure(chn, msg)
      }, 1650 - timeDiff)

      return
    }

    this._tsOfLastSend = Date.now()

    super.send(chn, msg)
  }
  
  send(chn: string, msg: string) {
    if (msg.length === 0 || msg[0] === "/" || msg[0] === "." || msg[0] === "!")
      return

    this.sendInsecure(chn, msg)
  }

  command(regexp: RegExp) {
    return this.on("privmsg").pipe(
      map(event => {
        const match = regexp.exec(event.msg)

        if (match) {
          return new CommandRequest(event, match, this)
        } else {
          return null
        }
      }),
      filter((req): req is CommandRequest => !!req),
    )
  }

  controller<TConstructor extends { new(): Controller }>(ctrl: Controller | TConstructor) {
    const controller = (typeof ctrl === "function") ? new ctrl() : ctrl

    return this.command(controller.regexp)
      .subscribe(req => controller.run(req))
  }
}
