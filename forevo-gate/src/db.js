import { JSONFilePreset } from 'lowdb/node'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = path.join(__dirname, '..', 'db.json')

// Структура по умолчанию
export const db = await JSONFilePreset(file, { users: [], checks: [] })
