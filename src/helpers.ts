import * as fs from "node:fs/promises"
import net, { type TcpSocketConnectOpts } from "node:net"
import type { Host, PowerStatus } from "./types.js"
import {
  STATUS_ARTIFACT_FILE,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  REQUEST_TIMEOUT,
} from "./constants.js"

export function checkIsOnline(
  { ip, port }: Host,
  timeout: number = REQUEST_TIMEOUT
) {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket()

    socket.setTimeout(timeout)
    socket.on("connect", () => {
      socket.destroy()
      resolve(true)
    })
    socket.on("timeout", () => {
      socket.destroy()
      resolve(false)
    })
    socket.on("error", () => {
      resolve(false)
    })

    const options = {} as TcpSocketConnectOpts
    if (ip) options.host = String(ip)
    if (port) options.port = Number(port)

    socket.connect(options)
  })
}

export async function getLastStatus() {
  const data = await fs.readFile(STATUS_ARTIFACT_FILE, "utf-8")
  return JSON.parse(data) as PowerStatus
}

export async function saveLastStatus(status: PowerStatus) {
  await fs.writeFile(
    STATUS_ARTIFACT_FILE,
    JSON.stringify(status, null, 2),
    "utf-8"
  )
  console.log("Status saved:", status)
}

export function formatDuration(startTimestamp: string, endTimestamp: string) {
  const startTime = new Date(startTimestamp).getTime()
  const endTime = new Date(endTimestamp).getTime()
  const diffTime = endTime - startTime

  const hours = Math.floor(diffTime / (1_000 * 60 * 60))
  const minutes = Math.floor((diffTime % (1_000 * 60 * 60)) / (1_000 * 60))

  if (hours > 0) {
    return `${hours} год ${minutes} хв`
  }
  return `${minutes} хв`
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString("uk-UA", {
    timeZone: "Europe/Kyiv",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export async function sendNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram credentials not configured")
    return
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Telegram API error: ${response.status} - ${errorData}`)
    }

    console.log("Telegram notification sent")
  } catch (error) {
    console.error("Failed to send Telegram message:", error)
  }
}
