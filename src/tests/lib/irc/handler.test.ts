import { IrcHandler } from "../../../lib/irc";

describe("lib/irc/handler", () => {
  test("connect()", async () => {
    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      line => { },
      mockCallback,
      () => { },
    )

    handler
      .once("connect")
      .then(mockCallback)

    await handler.connect()

    expect(mockCallback).toHaveBeenCalledTimes(2)
  })

  test("disconnect()", async () => {
    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      line => { },
      () => { },
      mockCallback,
    )

    handler
      .once("disconnect")
      .then(mockCallback)

    await handler.disconnect()

    expect(mockCallback).toHaveBeenCalledTimes(2)
  })

  test("reconnect()", async () => {
    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      line => { },
      mockCallback,
      mockCallback,
    )

    handler
      .once("connect")
      .then(mockCallback)

    handler
      .once("disconnect")
      .then(mockCallback)

    await handler.reconnect()

    expect(mockCallback).toHaveBeenCalledTimes(4)
  })

  test("login(...)", async () => {
    const nick = "nick"
    const pass = "pass"

    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      mockCallback,
      () => { },
      () => { },
    )

    await handler.login(nick, pass)

    expect(mockCallback).toHaveBeenNthCalledWith(2, `NICK ${nick}`)
    expect(mockCallback).toHaveBeenNthCalledWith(1, `PASS ${pass}`)
  })

  test.todo("loginAnon()")

  test("send(...)", async () => {
    const chn = "chn"
    const msg = "msg"

    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      mockCallback,
      () => { },
      () => { },
    )

    await handler.send(chn, msg)

    expect(mockCallback).toHaveBeenNthCalledWith(1, `PRIVMSG #${chn} :${msg}`)
  })

  test.todo("whisper(...)")

  test("join(...)", async () => {
    const chn = "chn"

    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      mockCallback,
      () => { },
      () => { },
    )

    await handler.join(chn)

    expect(mockCallback).toHaveBeenNthCalledWith(1, `JOIN #${chn}`)
  })

  test("part(...)", async () => {
    const chn = "chn"

    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      mockCallback,
      () => { },
      () => { },
    )

    await handler.part(chn)

    expect(mockCallback).toHaveBeenNthCalledWith(1, `PART #${chn}`)
  })

  test("reqCap(...)", async () => {
    const cap = "cap"

    const mockCallback = jest.fn()

    const handler = new IrcHandler(
      mockCallback,
      () => { },
      () => { },
    )

    await handler.reqCap(cap)

    expect(mockCallback).toHaveBeenNthCalledWith(1, `CAP REQ ${cap}`)
  })

  test("feed(privmsg)", async () => {
    const usr = "usr"
    const chn = "chn"
    const msg = "msg"
    const tags = new Map<any, any>([
      ["tag1", "value1"],
      ["tag2", "value2.1 value2.2 value2.3"],
      ["tag3", 123],
    ])
    const line = `@${[...tags].map(([k, v]) => `${k}=${String(v).replace(/ /g, "\\s")}`).join(";")} :${usr}!${usr}@${usr}.tmi.twitch.tv PRIVMSG #${chn} :${msg}`

    const mockupObserver = jest.fn()

    const handler = new IrcHandler(
      line => { },
      () => { },
      () => { },
    )

    handler.events
      .subscribe(mockupObserver)

    handler.feed(line)

    expect(mockupObserver).toHaveBeenCalledTimes(1)

    const event = mockupObserver.mock.calls[0][0]

    expect(event.event).toBe("privmsg")
    expect(event.usr).toBe(usr)
    expect(event.chn).toBe(chn)
    expect(event.msg).toBe(msg)
    expect([...event.tags]).toEqual([...tags])
  })
})
