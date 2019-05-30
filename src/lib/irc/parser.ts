import { IrcTags, IrcEvent, IrcEventMap } from "./data";

type IrcEventParserFn = (line: string, tags: IrcTags) => IrcEvent | null

export function fillTagsMap(tags: IrcTags, line: string, start: number, end: number) {
  let key = ""
  let value = ""
  let valueAsNumber = 0
  let lastI = start

  for (let i = lastI; i < end; i++) {
    switch (line[i]) {
      case "=":
        key = line.slice(lastI, i)
        lastI = i + 1
        break

      case ";":
      case " ":
        value = line.slice(lastI, i)
        valueAsNumber = Number(value)
        tags.set(key, isNaN(valueAsNumber) ? value.replace(/\\s/g, " ") : valueAsNumber)
        lastI = i + 1
        break
    }
  }
}

export function parseTags(line: string): [string, IrcTags] {
  let tags = new Map<string, any>() as IrcTags

  if (line[0] === "@") {
    const indexOfTagsEnd = line.indexOf(" ") + 1

    tags = new Proxy(tags, {
      get: (tags: any, p: any) => {
        if (tags.size === 0) {
          fillTagsMap(tags, line, 1, indexOfTagsEnd)
        }

        if (typeof tags[p] === "function") {
          return tags[p].bind(tags)
        } else {
          return tags[p]
        }
      },
    })

    return [line.slice(indexOfTagsEnd), tags]
  }

  return [line, tags]
}

export function parsePrivmsg(line: string, tags: IrcTags): IrcEventMap["privmsg"] | null {
  const regex = /:(\w+)!\w+@\S+ PRIVMSG #(\w+) :/
  const match = regex.exec(line)

  if (match) {
    return {
      event: "privmsg",
      usr: match[1],
      chn: match[2],
      msg: line.slice(match[0].length),
      tags: tags,
    }
  } else {
    return null
  }
}

export function parsePing(line: string): IrcEventMap["ping"] | null {
  const regex = /PING :(.*)/
  const match = regex.exec(line)

  if (match) {
    return {
      event: "ping",
      src: match[1],
    }
  } else {
    return null
  }
}

export function parseClearchat(line: string, tags: IrcTags): IrcEventMap["clearchat"] | null {
  const regex = /:\S+ CLEARCHAT #(\w+) :(\w+)/
  const match = regex.exec(line)

  if (match) {
    return {
      event: "clearchat",
      usr: match[2],
      chn: match[1],
      tags: tags,
    }
  } else {
    return null
  }
}

export function parseUsernotice(line: string, tags: IrcTags): IrcEventMap["usernotice"] | null {
  const regex = /:\S+ USERNOTICE #(\w+)/
  const match = regex.exec(line)

  if (match) {
    return {
      event: "usernotice",
      chn: match[1],
      tags: tags,
    }
  } else {
    return null
  }
}

export function parseUserstate(line: string, tags: IrcTags): IrcEventMap["userstate"] | null {
  const regex = /:\S+ USERSTATE #(\w+)/
  const match = regex.exec(line)

  if (match) {
    return {
      event: "userstate",
      chn: match[1],
      tags: tags,
    }
  } else {
    return null
  }
}

export function parseRoomstate(line: string, tags: IrcTags): IrcEventMap["roomstate"] | null {
  const regex = /:\S+ ROOMSTATE #(\w+)/
  const match = regex.exec(line)

  if (match) {
    return {
      event: "roomstate",
      chn: match[1],
      tags: tags,
    }
  } else {
    return null
  }
}

export function parseReconnect(line: string): IrcEventMap["reconnect"] | null {
  if (line.includes("RECONNECT")) {
    return {
      event: "reconnect",
    }
  } else {
    return null
  }
}

export function parseIrcEvent(line: string, tags: IrcTags): IrcEvent {
  const parsers: IrcEventParserFn[] = [
    parsePrivmsg,
    parsePing,
    parseClearchat,
    parseUsernotice,
    parseUserstate,
    parseRoomstate,
    parseReconnect,
  ]

  for (const parser of parsers) {
    const event = parser(line, tags)

    if (event) {
      return event
    }
  }

  return {
    event: "unknown",
    line,
    tags,
  }
}

export function lineToLineAndTags(line: string) {
  return parseTags(line)
}

export function lineAndTagsToIrcEvent([line, tags]: [string, IrcTags]) {
  return parseIrcEvent(line, tags)
}
