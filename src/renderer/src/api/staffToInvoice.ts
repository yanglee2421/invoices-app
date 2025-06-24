import { useMutation, useQueryClient } from '@tanstack/react-query'

type StaffToInvoiceNewPayload = {
  staffId: number
  invoiceId: number
}[]

export const useStaffToInvoiceNew = () => {
  const queryClient = useQueryClient()
  return useMutation({
    async mutationFn(payload: StaffToInvoiceNewPayload) {
      return window.electron.ipcRenderer.invoke('staffToInvoice:new', payload)
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ['staff']
      })
      await queryClient.invalidateQueries({
        queryKey: ['invoice']
      })
    }
  })
}
