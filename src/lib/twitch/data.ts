export type Tags = any

export interface PrivmsgTags {
  "badges": string
  "color": string
  "display-name": string
  "emotes": string
  "id": string
  "mod": "0" | "1"
  "room-id": string
  "subscriber": "0" | "1"
  "tmi-sent-ts": string
  "turbo": "0" | "1"
  "user-id": string
  "user-type": string
}

export interface ClearchatTags {
  "ban-duration": string
  "ban-reason": string
  "room-id": string
  "target-user-id": string
  "tmi-sent-ts": string
}

export interface UsernoticeTags extends PrivmsgTags {
  "login": string
  "msg-id": "sub" | "resub" | "subgift"
  "msg-param-months": string
  "msg-param-sub-plan-name": string
  "msg-param-sub-plan": "Prime" | "1000" | "2000" | "3000"
  "system-msg": string
  "msg-param-recipient-display-name"?: string
  "msg-param-recipient-id"?: string
  "msg-param-recipient-user-name"?: string
  "msg-param-sender-count"?: string
}

export interface UserstateTags {
  "badges": string
  "color": string
  "display-name": string
  "emote-sets": string
  "mod": "0" | "1"
  "subscriber": "0" | "1"
  "user-type": string
}

export interface RoomstateTags {
  "broadcaster-lang": string
  "emote-only": "0" | "1"
  "followers-only": string
  "r9k": "0" | "1"
  "rituals": "0" | "1"
  "room-id": string
  "slow": "0" | "1"
  "subs-only": "0" | "1"
}

export class IrcEvent {
  constructor(
    public type: keyof IrcEventMap,
  ) { }
}

export class UnknownEvent extends IrcEvent {
  constructor(
    public line: string,
    public tags: Tags,
  ) {
    super("unknown")
  }
}

export class PrivmsgEvent extends IrcEvent {
  constructor(
    public usr: string,
    public chn: string,
    public msg: string,
    public tags: PrivmsgTags,
  ) {
    super("privmsg")
  }
}

export class PingEvent extends IrcEvent {
  constructor(
    public src: string,
  ) {
    super("ping")
  }
}

export class ReconnectEvent extends IrcEvent {
  constructor(
  ) {
    super("reconnect")
  }
}

export interface IrcEventMap {
  connect: undefined
  error: any
  close: undefined
  unknown: UnknownEvent
  privmsg: PrivmsgEvent
  ping: PingEvent
  reconnect: ReconnectEvent
}
