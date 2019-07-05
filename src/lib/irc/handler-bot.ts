import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { IrcEventMap } from "./data";
import { IrcHandler } from "./handler";

interface Controller {
  regexp: RegExp
  run: (req: IrcHandlerBotRequest) => unknown
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export class IrcHandlerBotRequest {
  constructor(
    private _event: IrcEventMap["privmsg"],
    private _match: RegExpExecArray,
    private _bot: IrcHandlerBot<any>,
  ) { }

  async sendInsecure(msg: string) {
    await this._bot.sendInsecure(this.chn, msg)
  }

  async send(msg: string) {
    await this._bot.send(this.chn, msg)
  }

  async reply(msg: string) {
    await this.send(`@${this.usr} ${msg}`)
  }

  async whisper(msg: string) {
    await this.send(`/w ${this.usr} ${msg}`)
  }

  get usr() {
    return this._event.usr
  }

  get chn() {
    return this._event.chn
  }

  get msg() {
    return this._event.msg
  }

  get tags() {
    return this._event.tags
  }

  get match() {
    return this._match
  }

  get bot() {
    return this._bot
  }
}

export class IrcHandlerBot<EventMap extends IrcEventMap = IrcEventMap> extends IrcHandler<EventMap> {
  private _tsOfLastSend = 0
  private _messagesInWait = 0

  public messageQueueSize = 3
  public messageTimeout = 1600

  async sendInsecure(chn: string, msg: string) {
    if (this._messagesInWait >= (this.messageQueueSize - 1)) {
      return
    }

    this._messagesInWait++

    while (true) {
      const now = Date.now()
      const timeDiff = (now - this._tsOfLastSend)

      if (timeDiff > this.messageTimeout) {
        this._messagesInWait--
        this._tsOfLastSend = now
        await super.send(chn, msg)
        break
      } else {
        await delay((this.messageTimeout + 1) - timeDiff)
      }
    }
  }

  async send(chn: string, msg: string) {
    if (msg.length === 0 || msg[0] === "/" || msg[0] === "." || msg[0] === "!")
      return

    await this.sendInsecure(chn, msg)
  }

  command(regexp: RegExp): Observable<IrcHandlerBotRequest> {
    return this
      .on("privmsg")
      .pipe(
        map(event => {
          const match = regexp.exec(event.msg)

          if (match) {
            return new IrcHandlerBotRequest(event, match, this)
          } else {
            return null
          }
        }),
        filter((req): req is IrcHandlerBotRequest => !!req),
      )
  }

  controller<TConstructor extends { new(): Controller }>(ctrl: Controller | TConstructor) {
    const controller = (typeof ctrl === "function") ? new ctrl() : ctrl

    return this
      .command(controller.regexp)
      .subscribe(req => controller.run(req))
  }

  use(...fns: ((bot: IrcHandlerBot<any>) => unknown)[]) {
    for (const fn of fns) {
      fn(this)
    }
  }
}
