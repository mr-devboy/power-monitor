import { IP, PORT, RETRY_TIMEOUT } from "./constants.js"
import {
  checkIsOnline,
  getLastStatus,
  saveLastStatus,
  formatDuration,
  sendNotification,
  formatTime,
} from "./helpers.js"
import { type Host } from "./types.js"

async function main() {
  console.log("Starting power monitor check...")

  if (!IP || !PORT) {
    console.error("IP and PORT must be set")
    process.exit(1)
  }

  const host: Host = {
    ip: IP,
    port: PORT,
  }

  const isOnline = await checkIsOnline(host)
  const currentTime = new Date().toISOString()
  const lastStatus = await getLastStatus()

  if (isOnline !== lastStatus.isOnline) {
    setTimeout(async () => {
      const isOnlineYet = await checkIsOnline(host)

      if (isOnline === isOnlineYet) {
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

        await sendNotification(message)
        await saveLastStatus({
          isOnline,
          statusChangedAt: currentTime,
        })
      }
    }, RETRY_TIMEOUT)
    console.log(`Host is ${isOnline ? "ONLINE" : "OFFLINE"}`)
  } else {
    console.log(`Host status unchanged: ${isOnline ? "ONLINE" : "OFFLINE"}`)
  }
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
