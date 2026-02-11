import * as path from "node:path"

export const { IP, PORT, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

export const STATUS_ARTIFACT_FILE = path.join(
  process.cwd(),
  "artifacts/status.json"
)

export const REQUEST_TIMEOUT = 5 * 1_000 // 5 seconds
export const RETRY_TIMEOUT = 3 * 60 * 1_000 // 3 minutes
