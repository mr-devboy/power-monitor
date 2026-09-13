import * as fs from "node:fs/promises"
import net, { type TcpSocketConnectOpts } from "node:net"

import {
  STATUS_ARTIFACT_FILE,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  REQUEST_TIMEOUT,
} from "./constants.js"
import type { Host, PowerStatus } from "./types.js"

export function checkIsOnline(
  { ip, port }: Host,
  timeout: number = REQUEST_TIMEOUT
) {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket()
    let settled = false

    const finish = (result: boolean, reason?: string) => {
      if (settled) return
      settled = true
      socket.destroy()
      if (reason) console.log(`❌ Connection failed: ${reason}.`)
      resolve(result)
    }

    socket.setTimeout(timeout)
    socket.on("connect", () => finish(true))
    socket.on("timeout", () => finish(false, `timeout after ${timeout}ms`))
    socket.on("error", (error) => finish(false, error.message))

    const options = {} as TcpSocketConnectOpts
    if (ip) options.host = String(ip)
    if (port) options.port = Number(port)

    socket.connect(options)
  })
}

export async function loadLastStatus(): Promise<Partial<PowerStatus>> {
  console.log("🌀 Loading last status...")

  try {
    const data = await fs.readFile(STATUS_ARTIFACT_FILE, "utf-8")
    const status = JSON.parse(data) as Partial<PowerStatus>

    console.log("✅ Loading last status finished.")
    return status
  } catch (error) {
    console.error(
      `❌ Loading last status failed: ${(error as Error).message}. Treating as unknown.`
    )
    return {}
  }
}

export async function saveLastStatus(status: PowerStatus) {
  console.log("🌀 Saving status...")

  await fs.writeFile(
    STATUS_ARTIFACT_FILE,
    JSON.stringify(status, null, 2),
    "utf-8"
  )

  console.log("✅ Saving status finished.")
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

/** Returns true if the message was delivered. */
export async function sendNotification(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("❌ Missing telegram bot token or chat id.")
    return false
  }

  console.log("🌀 Sending notification...")

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`${response.status} ${errorData}`)
    }

    console.log("🟢 Notification sent.")
    return true
  } catch (error) {
    console.log("🔴 Notification not sent.", (error as Error).message)
    return false
  }
}
