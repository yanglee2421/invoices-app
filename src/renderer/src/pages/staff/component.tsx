import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material'
import React from 'react'
import { queryOptions, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Staff } from '../../../../main/schema'
import { RefreshOutlined } from '@mui/icons-material'

const fetchInvoice = () => {
  return queryOptions({
    queryKey: ['staff'],
    queryFn() {
      return window.electron.ipcRenderer.invoke('staff', {}) as unknown as {
        total: number
        rows: Staff[]
      }
    }
  })
}

const columnHelper = createColumnHelper<Staff>()

const columns = [columnHelper.accessor('id', {}), columnHelper.accessor('name', {})]

export const Component: React.FC = () => {
  'use no memo'
  const query = useQuery(fetchInvoice())

  const data = React.useMemo(() => query.data?.rows || [], [query.data])

  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    data,
    columns,
    getRowId: (row) => row.id.toString(),
    rowCount: query.data?.total
  })

  const renderTableBody = () => {
    if (query.isPending) {
      return (
        <TableRow>
          <TableCell colSpan={table.getAllLeafColumns().length}>
            <Typography textAlign={'center'}>加载中</Typography>
          </TableCell>
        </TableRow>
      )
    }

    if (query.isError) {
      return null
    }

    if (!table.getRowCount()) {
      return (
        <TableRow>
          <TableCell colSpan={table.getAllLeafColumns().length}>
            <Typography textAlign={'center'}>空</Typography>
          </TableCell>
        </TableRow>
      )
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {cell.getIsPlaceholder() || flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <Box padding={3}>
      <Card>
        <CardHeader
          action={
            <IconButton onClick={() => query.refetch()}>
              <RefreshOutlined />
            </IconButton>
          }
        />
        <CardContent></CardContent>
        {query.isFetching && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ||
                        flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>{renderTableBody()}</TableBody>
            <TableFooter>
              {table.getFooterGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ||
                        flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </TableContainer>
        <TablePagination
          component={'div'}
          rowsPerPage={20}
          count={0}
          page={0}
          rowsPerPageOptions={[20, 50, 100]}
          onPageChange={Boolean}
          onRowsPerPageChange={Boolean}
        />
      </Card>
    </Box>
  )
}
