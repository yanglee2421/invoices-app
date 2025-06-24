import { queryOptions } from '@tanstack/react-query'

type StaffSelectParams = {
  pageIndex?: number
  pageSize?: number
}

type StaffInsertParams = {
  name: string
}[]

export const fetchStaff = () =>
  queryOptions({
    queryKey: []
  })
