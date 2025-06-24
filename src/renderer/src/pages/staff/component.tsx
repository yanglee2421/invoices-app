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
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { MoreVertOutlined, RefreshOutlined } from '@mui/icons-material'
import { fetchStaff, Staff } from '@renderer/api/staff'

const columnHelper = createColumnHelper<Staff>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID'
  }),
  columnHelper.accessor('name', {
    header: '名称'
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell() {
      return (
        <IconButton>
          <MoreVertOutlined />
        </IconButton>
      )
    }
  })
]

export const Component: React.FC = () => {
  'use no memo'
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(20)

  const query = useQuery({
    ...fetchStaff({
      pageIndex,
      pageSize
    }),
    placeholderData: keepPreviousData
  })

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
      return (
        <TableRow>
          <TableCell colSpan={table.getAllLeafColumns().length}>
            <Typography textAlign={'center'}>{query.error.message}</Typography>
          </TableCell>
        </TableRow>
      )
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
            <IconButton onClick={() => query.refetch()} disabled={query.isFetching}>
              <RefreshOutlined />
            </IconButton>
          }
          title="人员管理"
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
          rowsPerPage={pageSize}
          count={table.getRowCount()}
          page={pageIndex}
          rowsPerPageOptions={[20, 50, 100]}
          onPageChange={(_, page) => {
            setPageIndex(page)
          }}
          onRowsPerPageChange={(e) => {
            setPageSize(Number.parseInt(e.target.value))
          }}
        />
      </Card>
    </Box>
  )
}
