import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import * as schema from './schema'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { app } from 'electron'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(app.getPath('userData'), 'db.db')
const sqliteDb = new Database(dbPath)
export const db = drizzle(sqliteDb, { schema })
migrate(db, { migrationsFolder: join(__dirname, '../../drizzle') })
