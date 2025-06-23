import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'

export type StaffToInvoice = {
  staffId: number
  invoiceId: number
  staff: {
    id: number
    name: string | null
    alias: null
    enableAlias: null
  }
}

export type Invoice = {
  id: number
  code: string | null
  amount: string | null
  date: string | null
  staffToInvoice: StaffToInvoice[]
}

export type fetchInvoiceParams = {
  code?: string
  amount?: string
  date?: string
  pageIndex?: number
  pageSize?: number
}

export const fetchInvoice = (params: fetchInvoiceParams) =>
  queryOptions({
    queryKey: ['invoice', params],
    queryFn() {
      return window.electron.ipcRenderer.invoke('invoice', params) as unknown as {
        total: number
        rows: Invoice[]
      }
    }
  })

export type InvoiceInsertPayload = {
  code: string
  amount: string
  date: string
}[]

export const useInvoiceNew = () => {
  const queryClient = useQueryClient()
  return useMutation({
    async mutationFn(payload: InvoiceInsertPayload) {
      await window.electron.ipcRenderer.invoke('invoice:new', payload)
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ['invoice']
      })
    }
  })
}
