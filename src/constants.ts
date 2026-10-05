import * as path from "node:path"

export const { IP, PORT, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

export const STATUS_ARTIFACT_FILE = path.join(
  process.cwd(),
  "artifacts/status.json"
)

export const REQUEST_TIMEOUT = 5 * 1_000 // 5 seconds
export const CHECK_INTERVAL = 30 * 1_000 // 30 seconds
export const CHECK_DURATION = 3 * 60 * 1_000 // 3 minutes
export const ONLINE_CONFIRM_TIMEOUT = 1 * 60 * 1_000 // 1 minute
export const OFFLINE_CONFIRM_TIMEOUT = 3 * 60 * 1_000 // 3 minutes
