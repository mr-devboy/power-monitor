import {
  CHECK_DURATION,
  CHECK_INTERVAL,
  IP,
  OFFLINE_CONFIRM_TIMEOUT,
  ONLINE_CONFIRM_TIMEOUT,
  PORT,
} from "./constants.js"
import {
  checkIsOnline,
  formatDuration,
  formatTime,
  loadLastStatus,
  saveLastStatus,
  sendNotification,
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

async function run() {
  if (!IP) throw Error("❌ Missing IP.")
  if (!PORT) throw Error("❌ Missing PORT.")

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

        const delivered = await sendNotification(message)
        if (!delivered) console.log("⚠️ Saving status anyway.")

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
