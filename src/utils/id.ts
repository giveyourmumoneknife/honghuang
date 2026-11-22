const ID_PATTERN = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/

export function isValidId(value: string): boolean {
  return ID_PATTERN.test(value)
}

export function assertValidId(value: string, label = 'content id'): void {
  if (!isValidId(value)) {
    throw new Error(`${label} 必须是小写命名空间 ID，收到：${value}`)
  }
}
