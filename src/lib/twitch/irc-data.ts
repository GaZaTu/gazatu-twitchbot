import { IrcEventMap, IrcPrivmsg, IrcClearchat, IrcUsernotice, IrcUserstate, IrcRoomstate } from "../irc/data";

export type TwitchIrcPrivmsg = IrcPrivmsg<{
  "badge-info": string
  "badges": string
  "color": string
  "display-name": string
  "emotes": string | 0
  "flags": string | 0
  "id": string
  "mod": 1 | 0
  "room-id": number
  "subscriber": 1 | 0
  "tmi-sent-ts": number
  "turbo": 1 | 0
  "user-id": number
  "user-type": string
}>

export type TwitchIrcClearchat = IrcClearchat<{
  "ban-duration": number
  "room-id": number
  "target-user-id": number
  "tmi-sent-ts": number
}>

export type TwitchIrcUsernotice = IrcUsernotice<{
  "badge-info": string
  "color": string
  "display-name": string
  "emotes": string | 0
  "flags": string | 0
  "id": string
  "login": string
  "mod": 1 | 0
  "msg-id": string
  "msg-param-cumulative-months": number
  "msg-param-months": number
  "msg-param-should-share-streak": number
  "msg-param-sub-plan-name": string
  "msg-param-sub-plan": string
  "room-id": number
  "subscriber": 1 | 0
  "system-msg": string
  "tmi-sent-ts": number
  "user-id": number
  "user-type": number
}>

export type TwitchIrcUserstate = IrcUserstate<{
  "badge-info": string
  "badges": string
  "color": string
  "display-name": string
  "emote-sets": string
  "mod": 1 | 0
  "subscriber": 1 | 0
  "user-type": number
}>

export type TwitchIrcRoomstate = IrcRoomstate<{
  "emote-only": 1 | 0
  "followers-only": number
  "r9k": 1 | 0
  "rituals": 1 | 0
  "room-id": number
  "slow": 1 | 0
  "subs-only": 1 | 0
}>

export interface TwitchIrcEventMap extends IrcEventMap {
  "privmsg": TwitchIrcPrivmsg
  "clearchat": TwitchIrcClearchat
  "usernotice": TwitchIrcUsernotice
  "userstate": TwitchIrcUserstate
  "roomstate": TwitchIrcRoomstate
}
