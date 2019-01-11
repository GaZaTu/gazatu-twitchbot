import { compareTwoStrings } from "string-similarity";
import axios from "axios";
import { readFile } from "fs";
import { promisify } from "util";
import { IrcBot, CommandRequest, PrivmsgEvent } from "../lib/twitch";

interface Question {
  id?: number
  category: string
  question: string
  answer: string
  hints: string[]
}

async function getJServiceQuestions(count: number | string) {
  const res = await axios.get(`http://jservice.io/api/random?count=${count}`)
  const questions = [] as Question[]

  for (const idx in res.data) {
    const item = res.data[parseInt(idx)]
    const answer = item.answer.replace("<i>", "").replace("</i>", "")
    const spaces = (answer.match(/ /g) || []).length
    const spacesWord = (spaces === 1) ? "space" : "spaces"
    const hint1 = `the answer has ${answer.length - spaces} characters and ${spaces} ${spacesWord}`
    let hint2 = ""

    for (let i = 0; i < answer.length; i++) {
      if (i < answer.length / 2 || answer[i] === " ") {
        hint2 += answer[i]
      } else {
        hint2 += "_"
      }
    }

    questions.push({
      category: item.category.title,
      question: item.question,
      answer: answer,
      hints: ["trivia hint: " + hint1, "trivia hint: " + hint2],
    })
  }

  return questions
}

async function getGazatuWinQuestions(count: number | string, config = "") {
  const fixedConfig = config.trim().split(" ").join("&")
  const res = await axios.get(`https://api.gazatu.xyz/trivia/questions?count=${count}${fixedConfig ? `&${fixedConfig}` : ""}`)
  const questions = [] as Question[]

  for (const idx in res.data) {
    const item = res.data[parseInt(idx)]
    const answer = item.answer
    const spaces = (answer.match(/ /g) || []).length
    const spacesWord = (spaces === 1) ? "space" : "spaces"
    const hint1 = item.hint1 ? item.hint1 : `the answer has ${answer.length - spaces} characters and ${spaces} ${spacesWord}`
    let hint2 = item.hint2 ? item.hint2 : ""

    if (!item.hint2) {
      for (let i = 0; i < answer.length; i++) {
        if (i < answer.length / 2 || answer[i] === " ") {
          hint2 += answer[i]
        } else {
          hint2 += "_"
        }
      }
    }

    questions.push({
      id: item.id,
      category: item.category,
      question: item.question,
      answer: answer,
      hints: ["trivia hint: " + hint1, "trivia hint: " + hint2],
    })
  }

  return questions
}

function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }

  return a
}

async function getNamQuestions(count: number | string) {
  const buf = await promisify(readFile)(`${__dirname}/../../files/namwords.txt`)
  const words = buf.toString().split("\n")
  const questions = [] as Question[]

  shuffle(words)

  for (let i = 0; i < Number(count); i++) {
    questions.push({
      category: "",
      question: words[i].replace("nam", "___").toUpperCase().split("").join(" ") + " ❓",
      answer: "nam",
      hints: ["", ""],
    })
  }

  return questions
}

const trivia = {
  running: false,
  questions: 0,
  currentId: -1,
  timestamp: Date.now()
}

async function runTrivia(req: CommandRequest, questions: Question[]) {
  if (req.match[1] === "start" && (!trivia.running || trivia.timestamp + (1000 * 90) < Date.now())) {
    trivia.running = true
    trivia.questions = questions.length

    for (const idxxd in questions) {
      const idx = parseInt(idxxd)
      const item = questions[idx]

      if (!trivia.running) {
        break
      }

      if (item.id) {
        trivia.currentId = item.id;
      }

      trivia.timestamp = Date.now()

      await req.send(`${idx + 1}/${questions.length} category: ${item.category} :) question: ${item.question}`)

      const timer1 = setTimeout(() => req.send(item.hints[0]), 15000)
      const timer2 = setTimeout(() => req.send(item.hints[1]), 30000)

      let onmsg: (req: PrivmsgEvent) => void

      const done = new Promise<void>(resolve => {
        const timer3 = setTimeout(() => {
          req.send(`you guys suck lol the answer was "${item.answer}"`)

          resolve()
        }, 45000)

        onmsg = (req2) => {
          if (req2.chn !== req.chn) {
            return
          }

          const similarity = compareTwoStrings(req2.msg, item.answer)

          if (similarity < 0.9) {
            return
          }

          clearTimeout(timer1)
          clearTimeout(timer2)
          clearTimeout(timer3)

          req.send(`${req2.usr} got it right miniDank the answer was "${item.answer}"`)

          resolve()
        }
      })

      const sub = req.bot.on("privmsg").subscribe(onmsg!)

      await done
      sub.unsubscribe()
      trivia.currentId = -1
      await delay(10000)
    }

    req.send(`trivia ended nam`)
    trivia.running = false
  } else if (req.match[1] === "stop") {
    trivia.running = false
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function registerTrivia(bot: IrcBot) {
  bot.command(/^!customtrivia1 (start|stop)(?:(?: (\d+))|)/i).subscribe(async req => {
    const questions = await getJServiceQuestions(req.match[2] || 1)
    runTrivia(req, questions)
  })

  bot.command(/^!customtrivia3 (start|stop)(?:(?: (\d+)(.*))|)/i).subscribe(async req => {
    const questions = await getGazatuWinQuestions(req.match[2] || 1, req.match[3])
    runTrivia(req, questions)
  })

  bot.command(/^!namtrivia (start|stop)(?:(?: (\d+))|)/i).subscribe(async req => {
    const questions = await getNamQuestions(req.match[2] || 1)
    runTrivia(req, questions)
  })

  bot.command(/^!customtrivia3-report(:?$| (.+))/i).subscribe(async req => {
    if (trivia.currentId > 0) {
      await axios.post("http://api.gazatu.xyz/trivia/reports", {
        questionId: trivia.currentId,
        user: req.usr,
        message: req.match[1] ? req.match[1] : "",
      })

      req.reply("question reported :ok_hand:")
    }
  })
}
