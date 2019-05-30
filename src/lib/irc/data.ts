export interface IrcTags<T = { [key: string]: any }> extends Map<any, any> {
  delete(key: keyof T): boolean
  forEach(callbackfn: (value: T[keyof T], key: keyof T, map: IrcTags<T>) => void, thisArg?: any): void
  get<K extends keyof T>(key: K): T[K] | undefined
  has(key: keyof T): boolean
  set<K extends keyof T>(key: K, value: T[K]): this
  [Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]>
  entries(): IterableIterator<[keyof T, T[keyof T]]>
  keys(): IterableIterator<keyof T>
  values(): IterableIterator<T[keyof T]>
}

export interface IrcPrivmsg<Tags = any> {
  event: "privmsg"
  usr: string
  chn: string
  msg: string
  tags: IrcTags<Tags>
}

export interface IrcPing {
  event: "ping"
  src: string
}

export interface IrcClearchat<Tags = any> {
  event: "clearchat"
  usr: string
  chn: string
  tags: IrcTags<Tags>
}

export interface IrcUsernotice<Tags = any> {
  event: "usernotice"
  chn: string
  tags: IrcTags<Tags>
}

export interface IrcUserstate<Tags = any> {
  event: "userstate"
  chn: string
  tags: IrcTags<Tags>
}

export interface IrcRoomstate<Tags = any> {
  event: "roomstate"
  chn: string
  tags: IrcTags<Tags>
}

export interface IrcUnknown {
  event: "unknown"
  line: string
  tags: IrcTags
}

export interface IrcConnect {
  event: "connect"
}

export interface IrcDisconnect {
  event: "disconnect"
}

export interface IrcReconnect {
  event: "reconnect"
}

export interface IrcEventMap {
  "privmsg": IrcPrivmsg
  "ping": IrcPing
  "clearchat": IrcClearchat
  "usernotice": IrcUsernotice
  "userstate": IrcUserstate
  "roomstate": IrcRoomstate
  "connect": IrcConnect
  "disconnect": IrcDisconnect
  "reconnect": IrcReconnect
  "unknown": IrcUnknown
}

export type IrcEvent = IrcEventMap[keyof IrcEventMap]

export function ircEventIs<K extends IrcEvent["event"], EventMap extends IrcEventMap>(kind: K) {
  return (e: IrcEvent): e is EventMap[K] => {
    return e.event === kind
  }
}
