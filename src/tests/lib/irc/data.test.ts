import { ircEventIs, IrcPrivmsg } from "../../../lib/irc";

const ircPrivmsg: IrcPrivmsg = {
  event: "privmsg",
  usr: "",
  chn: "",
  msg: "",
  tags: new Map(),
}

describe("lib/irc/data", () => {
  test("ircEventIs('privmsg')(privmsg)", () => {
    expect(ircEventIs("privmsg")(ircPrivmsg)).toBe(true)
  })

  test("ircEventIs('unknown')(privmsg)", () => {
    expect(ircEventIs("unknown")(ircPrivmsg)).toBe(false)
  })
})
