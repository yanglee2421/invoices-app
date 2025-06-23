import { relations } from 'drizzle-orm'
import { int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const staff = sqliteTable('staff', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text(),
  alias: text().unique(),
  enableAlias: int({ mode: 'boolean' })
})

export type Staff = typeof staff.$inferSelect

export const staffRelation = relations(staff, (props) => ({
  staffToInvoice: props.many(staffToInvoice)
}))

export const invoice = sqliteTable('invoice', {
  id: int().primaryKey({ autoIncrement: true }),
  code: text().unique(),
  amount: text(),
  date: text()
})

export type Invoice = typeof invoice.$inferSelect

export const invoiceRelation = relations(invoice, (props) => ({
  staffToInvoice: props.many(staffToInvoice)
}))

export const staffToInvoice = sqliteTable(
  'staffToInvoice',
  {
    staffId: int().notNull(),
    invoiceId: int().notNull()
  },
  (table) => [primaryKey({ columns: [table.staffId, table.invoiceId] })]
)

export const staffToInvoiceRelation = relations(staffToInvoice, (props) => ({
  staff: props.one(staff, {
    fields: [staffToInvoice.staffId],
    references: [staff.id],
    relationName: 'toStaff'
  }),
  invoice: props.one(invoice, {
    fields: [staffToInvoice.invoiceId],
    references: [invoice.id],
    relationName: 'toInvoice'
  })
}))
