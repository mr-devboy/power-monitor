export interface Host {
  ip: string
  port: string
}

export interface PowerStatus {
  isOnline: boolean
  statusChangedAt?: string
}
