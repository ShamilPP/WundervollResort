import { prisma } from './db'

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const client = prisma as any
    const setting = await client.setting.findUnique({
      where: { key },
    })
    if (setting) return setting.value

    // Auto-seed default value
    await client.setting.create({
      data: { key, value: defaultValue },
    }).catch(() => null)

    return defaultValue
  } catch (err) {
    console.error(`[settings:get] Error fetching key "${key}":`, err)
    return defaultValue
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    const client = prisma as any
    await client.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  } catch (err) {
    console.error(`[settings:set] Error setting key "${key}":`, err)
    throw err
  }
}

export async function getAdvancePercentage(): Promise<number> {
  const valueStr = await getSetting('advance_percentage', '30')
  const val = parseInt(valueStr, 10)
  return isNaN(val) ? 30 : val
}
