import { Subject, Observable } from "rxjs";
import { filter, first } from "rxjs/operators";
import { IrcEventMap, IrcEvent, ircEventIs } from "./data";
import { lineAndTagsToIrcEvent, lineToLineAndTags } from "./parser";

export class IrcHandler<EventMap extends IrcEventMap = IrcEventMap> {
  private _events = new Subject<IrcEvent>()
  private _log = (line: any, io: "in" | "out") => { }

  constructor(
    private _callback: (line: string) => unknown,
    private _connect: () => unknown,
    private _disconnect: () => unknown,
  ) {
    this.on("ping")
      .subscribe(({ src }) => this.sendRawLine(`PONG :${src}`))

    this.on("reconnect")
      .subscribe(() => this.reconnect())
  }

  feed(line: string) {
    const lineAndTags = lineToLineAndTags(line)
    const ircEvent = lineAndTagsToIrcEvent(lineAndTags)

    this._log(line, "in")
    this._events.next(ircEvent)
  }

  private async sendRawLine(line: string) {
    this._log(line, "out")
    await this._callback(line)
  }

  async connect() {
    await this._connect()

    this._events.next({
      event: "connect",
    })
  }

  async disconnect() {
    await this._disconnect()

    this._events.next({
      event: "disconnect",
    })
  }

  async reconnect() {
    await this.disconnect()
    await this.connect()
  }

  async login(nick: string, pass: string) {
    await this.sendRawLine(`PASS ${pass}`)
    await this.sendRawLine(`NICK ${nick}`)
  }

  async loginAnon() {
    await this.sendRawLine(`NICK justinfan93434586`)
  }

  async send(chn: string, msg: string) {
    await this.sendRawLine(`PRIVMSG #${chn} :${msg}`)
  }

  async whisper(usr: string, msg: string) {
    await this.send("forsen", `/w ${usr} ${msg}`)
  }

  async join(chn: string) {
    await this.sendRawLine(`JOIN #${chn}`)
  }

  async part(chn: string) {
    await this.sendRawLine(`PART #${chn}`)
  }

  async reqCap(name: string) {
    await this.sendRawLine(`CAP REQ ${name}`)
  }

  on<K extends IrcEvent["event"]>(event: K) {
    return this._events
      .pipe(filter(ircEventIs<K, EventMap>(event)))
  }

  once<K extends IrcEvent["event"]>(event: K) {
    return this.on(event)
      .pipe(first())
      .toPromise()
  }

  get events() {
    return this._events.asObservable() as any as Observable<EventMap[keyof EventMap]>
  }

  get log() {
    return this._log
  }

  set log(value) {
    this._log = value
  }
}
