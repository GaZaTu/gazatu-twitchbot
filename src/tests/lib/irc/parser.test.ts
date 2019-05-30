import { fillTagsMap, parseTags, parsePrivmsg, parsePing, parseClearchat, parseUsernotice, parseUserstate, parseRoomstate, parseReconnect, parseIrcEvent } from "../../../lib/irc/parser";
import { IrcPrivmsg, IrcPing, IrcUnknown } from "../../../lib/irc";

describe("lib/irc/parser", () => {
  test("fillTagsMap('@tag1=...')", () => {
    const tags = new Map()
    const line = "@tag1=value1;tag2=value2.1\\svalue2.2\\svalue2.3;tag3=123 INVALID NON TAGS"
    const start = line.indexOf("@") + 1
    const end = line.indexOf(" ") + 1

    fillTagsMap(tags, line, start, end)

    expect(tags.size).toBe(3)
    expect(tags.get("tag1")).toBe("value1")
    expect(tags.get("tag2")).toBe("value2.1 value2.2 value2.3")
    expect(tags.get("tag3")).toBe(123)
  })

  test("parseTags('@tag1=...')", () => {
    const tagsStr = "@tag1=value1;tag2=value2.1\\svalue2.2\\svalue2.3;tag3=123"
    const lineStr = "INVALID NON TAGS"
    const rawLine = `${tagsStr} ${lineStr}`
    const [line, tags] = parseTags(rawLine)

    expect(line).toBe(lineStr)
    expect(tags.size).toBe(3)
    expect(tags.get("tag1")).toBe("value1")
    expect(tags.get("tag2")).toBe("value2.1 value2.2 value2.3")
    expect(tags.get("tag3")).toBe(123)
  })

  test("parseTags('non tags...')", () => {
    const rawLine = "INVALID NON TAGS"
    const [line, tags] = parseTags(rawLine)

    expect(line).toBe(rawLine)
    expect(tags.size).toBe(0)
  })

  test("parsePrivmsg(valid)", () => {
    const usr = "usr"
    const chn = "chn"
    const msg = "msg"
    const line = `:${usr}!${usr}@${usr}.tmi.twitch.tv PRIVMSG #${chn} :${msg}`
    const tags = new Map()
    const event = parsePrivmsg(line, tags)

    expect(event).toBeTruthy()
    expect(event!.event).toBe("privmsg")
    expect(event!.usr).toBe(usr)
    expect(event!.chn).toBe(chn)
    expect(event!.msg).toBe(msg)
    expect(event!.tags.size).toBe(tags.size)
  })

  test("parsePrivmsg(invalid)", () => {
    const line = `:usr!usr@usr.tmi.twitch.tv NOT_PRIVMSG #chn :msg`
    const tags = new Map()
    const event = parsePrivmsg(line, tags)

    expect(event).toBeFalsy()
  })

  test("parsePing(valid)", () => {
    const src = "tmi.twitch.tv"
    const line = `test PING :${src}`
    const event = parsePing(line)

    expect(event).toBeTruthy()
    expect(event!.event).toBe("ping")
    expect(event!.src).toBe(src)
  })

  test("parsePing(invalid)", () => {
    const line = `test NOT_PING: src`
    const event = parsePing(line)

    expect(event).toBeFalsy()
  })

  test("parseClearchat(valid)", () => {
    const usr = "usr"
    const chn = "chn"
    const line = `:something_to_ignore CLEARCHAT #${chn} :${usr}`
    const tags = new Map()
    const event = parseClearchat(line, tags)

    expect(event).toBeTruthy()
    expect(event!.event).toBe("clearchat")
    expect(event!.usr).toBe(usr)
    expect(event!.chn).toBe(chn)
    expect(event!.tags.size).toBe(tags.size)
  })

  test("parseClearchat(invalid)", () => {
    const line = `:something_to_ignore NOT_CLEARCHAT #chn :usr`
    const tags = new Map()
    const event = parseClearchat(line, tags)

    expect(event).toBeFalsy()
  })

  test("parseUsernotice(valid)", () => {
    const chn = "chn"
    const line = `:something_to_ignore USERNOTICE #${chn}`
    const tags = new Map()
    const event = parseUsernotice(line, tags)

    expect(event).toBeTruthy()
    expect(event!.event).toBe("usernotice")
    expect(event!.chn).toBe(chn)
    expect(event!.tags.size).toBe(tags.size)
  })

  test("parseUsernotice(invalid)", () => {
    const line = `:something_to_ignore NOT_USERNOTICE #chn`
    const tags = new Map()
    const event = parseUsernotice(line, tags)

    expect(event).toBeFalsy()
  })

  test("parseUserstate(valid)", () => {
    const chn = "chn"
    const line = `:something_to_ignore USERSTATE #${chn}`
    const tags = new Map()
    const event = parseUserstate(line, tags)

    expect(event).toBeTruthy()
    expect(event!.event).toBe("userstate")
    expect(event!.chn).toBe(chn)
    expect(event!.tags.size).toBe(tags.size)
  })

  test("parseUserstate(invalid)", () => {
    const line = `:something_to_ignore NOT_USERSTATE #chn`
    const tags = new Map()
    const event = parseUserstate(line, tags)

    expect(event).toBeFalsy()
  })

  test("parseRoomstate(valid)", () => {
    const chn = "chn"
    const line = `:something_to_ignore ROOMSTATE #${chn}`
    const tags = new Map()
    const event = parseRoomstate(line, tags)

    expect(event).toBeTruthy()
    expect(event!.event).toBe("roomstate")
    expect(event!.chn).toBe(chn)
    expect(event!.tags.size).toBe(tags.size)
  })

  test("parseRoomstate(invalid)", () => {
    const line = `:something_to_ignore NOT_ROOMSTATE #chn`
    const tags = new Map()
    const event = parseRoomstate(line, tags)

    expect(event).toBeFalsy()
  })

  test("parseReconnect(valid)", () => {
    const line = `RECONNECT`
    const event = parseReconnect(line)

    expect(event).toBeTruthy()
    expect(event!.event).toBe("reconnect")
  })

  test("parseReconnect(invalid)", () => {
    const line = `LMAO`
    const event = parseReconnect(line)

    expect(event).toBeFalsy()
  })

  test("parseIrcEvent(privmsg)", () => {
    const usr = "usr"
    const chn = "chn"
    const msg = "msg"
    const line = `:${usr}!${usr}@${usr}.tmi.twitch.tv PRIVMSG #${chn} :${msg}`
    const tags = new Map()
    const event = parseIrcEvent(line, tags) as IrcPrivmsg

    expect(event).toBeTruthy()
    expect(event!.event).toBe("privmsg")
    expect(event!.usr).toBe(usr)
    expect(event!.chn).toBe(chn)
    expect(event!.msg).toBe(msg)
    expect(event!.tags).toBeTruthy()
    expect(event!.tags.size).toBe(tags.size)
  })

  test("parseIrcEvent(ping)", () => {
    const src = "tmi.twitch.tv"
    const line = `PING :${src}`
    const tags = new Map()
    const event = parseIrcEvent(line, tags) as IrcPing

    expect(event).toBeTruthy()
    expect(event!.event).toBe("ping")
    expect(event!.src).toBe(src)
  })

  test("parseIrcEvent(unknown)", () => {
    const line = `UNKNOWN_EVENT`
    const tags = new Map()
    const event = parseIrcEvent(line, tags) as IrcUnknown

    expect(event).toBeTruthy()
    expect(event!.line).toBe(line)
    expect(event!.tags).toBeTruthy()
    expect(event!.tags.size).toBe(tags.size)
  })
})
