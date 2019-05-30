import * as WebSocket from "ws";
import { IrcHandlerBot } from "../irc/handler-bot";
import { TwitchIrcEventMap } from "./irc-data";

export class TwitchIrcBot extends IrcHandlerBot<TwitchIrcEventMap> {
  private _webSocket?: WebSocket
  private _webSocketOnMessage = (data: WebSocket.Data) => {
    for (const line of data.toString().split("\r\n")) {
      if (line.length) {
        this.feed(line)
      }
    }
  }

  constructor(
    private _wsUrl = "wss://irc-ws.chat.twitch.tv/",
  ) {
    super(
      line => this.handleCallback(line),
      () => this.handleConnect(),
      () => this.handleDisconnect(),
    )
  }

  async reqCap(name: "commands" | "membership" | "tags") {
    await super.reqCap(`:twitch.tv/${name}`)
  }

  private handleCallback(line: string) {
    return new Promise<void>((resolve, reject) => {
      if (!this._webSocket || this._webSocket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket not connected")
      }

      this._webSocket.send(line, err => err ? reject(err) : resolve())
    })
  }

  private handleConnect() {
    return new Promise<void>((resolve, reject) => {
      const handleOpenOrError = (err?: Error) => {
        this._webSocket!.removeEventListener("open", handleOpenOrError)
        this._webSocket!.removeEventListener("error", handleOpenOrError)

        err ? reject(err) : resolve()
      }

      this._webSocket = new WebSocket(this._wsUrl)

      this._webSocket.on("open", handleOpenOrError)
      this._webSocket.on("error", handleOpenOrError)
      this._webSocket.on("message", this._webSocketOnMessage)
    })
  }

  private handleDisconnect() {
    if (!this._webSocket) {
      return
    }

    this._webSocket.close()
    this._webSocket = undefined
  }
}
