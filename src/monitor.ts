import { IP, PORT, RETRY_TIMEOUT } from "./constants.js"
import {
  checkIsOnline,
  formatDuration,
  formatTime,
  loadLastStatus,
  saveLastStatus,
  sendNotification,
} from "./helpers.js"
import type { Host } from "./types.js"

async function run() {
  if (!IP) throw Error("Missing IP.")
  if (!PORT) throw Error("Missing PORT.")

  const host: Host = { ip: IP, port: PORT }

  console.log("🌀 Checking power...")

  const isOnline = await checkIsOnline(host)
  const currentTime = new Date().toISOString()
  const lastStatus = await loadLastStatus()

  isOnline ? console.log("🔋 Power is on!") : console.log("🪫 Power is off!")

  if (isOnline === lastStatus.isOnline) {
    console.log("✅ Power status unchanged.")
    return
  }

  console.log(
    `🌀 Power status changed, re-checking in ${RETRY_TIMEOUT / 60_000} min...`
  )

  setTimeout(async () => {
    const isOnlineYet = await checkIsOnline(host)

    if (isOnline !== isOnlineYet) {
      console.log("⚠️ Power status flapped back, ignoring change.")
      return
    }

    const duration = lastStatus.statusChangedAt
      ? formatDuration(lastStatus.statusChangedAt, currentTime)
      : null
    const time = formatTime(currentTime)

    const message = (
      isOnline
        ? [
            `🔋 <b>Світло з'явилося!</b>`,
            `👉 <code>${time}</code>`,
            duration && `\n<i>Не було: ${duration}</i>`,
          ]
        : [
            `🪫 <b>Світло зникло!</b>`,
            `👉 <code>${time}</code>`,
            duration && `\n<i>Було: ${duration}</i>`,
          ]
    )
      .filter(Boolean)
      .join("\n")

    const delivered = await sendNotification(message)
    if (!delivered) console.log("⚠️ Saving status anyway.")

    await saveLastStatus({ isOnline, statusChangedAt: currentTime })
  }, RETRY_TIMEOUT)
}

run().catch((error) => {
  console.error(`❌ ${error.message}`)
  process.exit(1)
})
