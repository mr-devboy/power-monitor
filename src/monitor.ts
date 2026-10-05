import {
  CHECK_DURATION,
  CHECK_INTERVAL,
  IP,
  OFFLINE_CONFIRM_TIMEOUT,
  ONLINE_CONFIRM_TIMEOUT,
  PORT,
  REQUEST_TIMEOUT,
  RETRIES_MAX_COUNT,
  RETRIES_TIMEOUT,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} from "./constants.js"
import {
  checkIsNight,
  checkIsOnline,
  formatDuration,
  formatTime,
  loadLastStatus,
  saveLastStatus,
} from "./helpers.js"
import type { Host, PowerStatus } from "./types.js"

async function checkPower(host: Host) {
  console.log("🌀 Checking power...")

  const isOnline = await checkIsOnline(host)

  isOnline ? console.log("🔋 Power is on!") : console.log("🪫 Power is off!")

  return isOnline
}

async function confirmPowerStatus(
  host: Host,
  isOnline: boolean,
  statusChangedAt: number
) {
  console.log("🌀 Power status changed, confirming...")

  while (
    Date.now() - statusChangedAt <
    (isOnline ? ONLINE_CONFIRM_TIMEOUT : OFFLINE_CONFIRM_TIMEOUT)
  ) {
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL))

    const isOnlineYet = await checkIsOnline(host)

    if (isOnline !== isOnlineYet) {
      console.log("⚠️ Power status flapped back, ignoring change.")
      return false
    }
  }

  console.log("✅ Power status confirmed.")
  return true
}

function generateMessage(
  isOnline: boolean,
  statusChangedAt: number,
  lastStatus: Partial<PowerStatus>
) {
  console.log("🌀 Generating message...")

  const duration = lastStatus.statusChangedAt
    ? formatDuration(
        new Date(lastStatus.statusChangedAt).getTime(),
        statusChangedAt
      )
    : null
  const time = formatTime(statusChangedAt)

  return (
    isOnline
      ? [
          `🔋 <b>Світло з'явилося!</b>`,
          `📍 <code>${time}</code>`,
          duration && `\n<i>🪫 ${duration}</i>`,
        ]
      : [
          `🪫 <b>Світло зникло!</b>`,
          `📍 <code>${time}</code>`,
          duration && `\n<i>🔋 ${duration}</i>`,
        ]
  )
    .filter(Boolean)
    .join("\n")
}

async function sendNotification(message: string, retries = 0) {
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
          disable_notification: checkIsNight(),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      }
    )

    const data = (await response.json()) as {
      ok: boolean
      description?: string
    }

    if (!data.ok) throw Error(data.description)

    console.log("🟢 Notification sent.")
    return
  } catch (error) {
    console.error(
      `❌ Sending notification failed: ${(error as Error).message}.`
    )
  }

  if (retries < RETRIES_MAX_COUNT) {
    console.log("🌀 Try sending notification again...")
    await new Promise((resolve) => setTimeout(resolve, RETRIES_TIMEOUT))
    return await sendNotification(message, retries + 1)
  }

  throw Error(
    `❌ Sending notification failed after ${RETRIES_MAX_COUNT} retries.`
  )
}

async function run() {
  if (!IP) throw Error("❌ Missing IP.")
  if (!PORT) throw Error("❌ Missing PORT.")
  if (!TELEGRAM_BOT_TOKEN) throw Error("❌ Missing telegram bot token.")
  if (!TELEGRAM_CHAT_ID) throw Error("❌ Missing telegram chat id.")

  const host: Host = { ip: IP, port: PORT }
  const checkStartedAt = Date.now()

  let lastStatus = await loadLastStatus()

  while (Date.now() - checkStartedAt < CHECK_DURATION) {
    const isOnline = await checkPower(host)

    if (isOnline !== lastStatus.isOnline) {
      const statusChangedAt = Date.now()
      const isStatusChanged = await confirmPowerStatus(
        host,
        isOnline,
        statusChangedAt
      )

      if (isStatusChanged) {
        const message = generateMessage(isOnline, statusChangedAt, lastStatus)

        await sendNotification(message)

        lastStatus = {
          isOnline,
          statusChangedAt: new Date(statusChangedAt).toISOString(),
        }
        await saveLastStatus(lastStatus)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL))
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
