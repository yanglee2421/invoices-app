import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Staff } from '@main/schema'
export type { Staff } from '@main/schema'

type StaffQueryResult = {
  rows: Staff[]
  count: number
}

type StaffSelectParams = {
  pageIndex?: number
  pageSize?: number
}

type StaffInsertParams = {
  name: string
}[]

export const fetchStaff = (params: StaffSelectParams) =>
  queryOptions({
    queryKey: ['staff', params],
    async queryFn() {
      const data = await window.electron.ipcRenderer.invoke('staff', params)
      return data
    }
  })

export const useStaffNew = () => {
  const queryClient = useQueryClient()
  return useMutation({
    async mutationFn(payload: StaffInsertParams) {
      const data: StaffQueryResult = await window.electron.ipcRenderer.invoke('staff:new', payload)
      return data
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ['staff']
      })
    }
  })
}
