import { IrcHandlerBot } from "../../../lib/irc";

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

describe("lib/irc/handler-bot", () => {
  test("sendInsecure(...)", async () => {
    const chn = "chn"
    const msg = "msg"

    const mockCallback = jest.fn()

    const handler = new IrcHandlerBot(
      mockCallback,
      () => { },
      () => { },
    )

    handler.messageQueueSize = 3
    handler.messageTimeout = 30

    for (let i = 0; i < handler.messageQueueSize + 1; i++) {
      handler.sendInsecure(chn, msg)
    }

    for (let i = 0; i < handler.messageQueueSize + 2; i++) {
      await delay(i * handler.messageTimeout)

      if (i >= handler.messageQueueSize) {
        expect(mockCallback).toHaveBeenCalledTimes(handler.messageQueueSize)
      } else {
        expect(mockCallback).toHaveBeenCalledTimes(i + 1)
        expect(mockCallback).toHaveBeenNthCalledWith(i + 1, `PRIVMSG #${chn} :${msg}`)
      }
    }
  })

  test("send(...)", async () => {
    const chn = "chn"
    const msg = "msg"

    const mockCallback = jest.fn()

    const handler = new IrcHandlerBot(
      mockCallback,
      () => { },
      () => { },
    )

    handler.messageQueueSize = 3
    handler.messageTimeout = 30

    await handler.send(chn, msg)
    await handler.send(chn, "")
    await handler.send(chn, ".")
    await handler.send(chn, "/")
    await handler.send(chn, "!")

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenNthCalledWith(1, `PRIVMSG #${chn} :${msg}`)
  })

  test("command(...)", async () => {
    const usr = "usr"
    const chn = "chn"
    const trigger = "!test"
    const value = "test"
    const reply = "lmao"
    const lines = [
      `:${usr}!${usr}@${usr}.tmi.twitch.tv PRIVMSG #${chn} :${trigger} ${value}`,
      `:${usr}!${usr}@${usr}.tmi.twitch.tv PRIVMSG #${chn} :not the trigger`,
      `:${usr}!${usr}@${usr}.tmi.twitch.tv PRIVMSG #${chn} :something else`,
      `UNKNOWN_EVENT`,
    ]

    const mockupCallback = jest.fn()
    const mockupObserver = jest.fn()

    const handler = new IrcHandlerBot(
      mockupCallback,
      () => { },
      () => { },
    )

    handler.messageQueueSize = 3
    handler.messageTimeout = 30

    handler
      .command(new RegExp(`^${trigger} (\\w+)`))
      .subscribe(mockupObserver)

    lines
      .forEach(l => handler.feed(l))

    expect(mockupCallback).toHaveBeenCalledTimes(0)
    expect(mockupObserver).toHaveBeenCalledTimes(1)

    const request = mockupObserver.mock.calls[0][0]

    expect(request.tags.size).toBe(0)
    expect(request.match[1]).toBe(value)

    await request.reply(reply)

    expect(mockupCallback).toHaveBeenCalledTimes(1)
    expect(mockupCallback).toHaveBeenNthCalledWith(1, `PRIVMSG #${chn} :@${usr} ${reply}`)
  })
})
