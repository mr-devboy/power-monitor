import * as path from "node:path"

export const { IP, PORT, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

export const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
export const TELEGRAM_UPDATE_CHAT_TITLE =
  process.env.TELEGRAM_UPDATE_CHAT_TITLE !== "false"

export const POWER_ON_ICON = "🔋"
export const POWER_OFF_ICON = "🪫"

export const STATUS_ARTIFACT_FILE = path.join(
  process.cwd(),
  "artifacts/status.json"
)

export const REQUEST_TIMEOUT = 5 * 1_000 // 5 seconds
export const RETRIES_MAX_COUNT = 5
export const RETRIES_TIMEOUT = 5 * 1_000 // 5 seconds

export const CHECK_INTERVAL = 30 * 1_000 // 30 seconds
export const CHECK_DURATION = 3 * 60 * 1_000 // 3 minutes

export const ONLINE_CONFIRM_TIMEOUT = 1 * 60 * 1_000 // 1 minute
export const OFFLINE_CONFIRM_TIMEOUT = 3 * 60 * 1_000 // 3 minutes
