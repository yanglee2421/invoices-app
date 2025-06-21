import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const invoice = sqliteTable('invoice', {
  id: int('id').primaryKey({ autoIncrement: true }),
  code: text().unique(),
  amount: text()
})

export type Invoice = typeof invoice.$inferSelect
