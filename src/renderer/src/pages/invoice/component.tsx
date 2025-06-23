import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
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
import { AddOutlined, EditOutlined, RefreshOutlined } from '@mui/icons-material'
import { Staff } from '@main/schema'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useDialogs, useNotifications, DialogProps } from '@toolpad/core'
import * as mathjs from 'mathjs'
import { fetchInvoice, Invoice } from '@renderer/api/invoice'

const formSchema = z.object({
  staff: z.number().array()
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: FormValues = {
  staff: []
}

type StaffSelectDialogProps = {
  id: number
}

const StaffSelectDialog = (props: StaffSelectDialogProps) => {
  const [open, setOpen] = React.useState(false)

  const formId = React.useId()

  const toast = useNotifications()

  const form = useForm({
    defaultValues,
    async onSubmit({ value }) {
      try {
        for (const staffId of value.staff) {
          await window.electron.ipcRenderer.invoke('staffToInvoice:new', {
            staffId,
            invoiceId: props.id
          })
        }
        handleClose()
      } catch (error) {
        toast.show(error.message, { severity: 'error' })
      }
    },
    validators: {
      onChange: formSchema
    }
  })

  const query = useQuery({
    queryKey: ['staff'],
    queryFn: () => {
      return window.electron.ipcRenderer.invoke('staff', {}) as unknown as {
        total: number
        rows: Staff[]
      }
    }
  })

  const handleClose = () => setOpen(false)

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <EditOutlined />
      </IconButton>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>选择员工</DialogTitle>
        <DialogContent>
          <form
            id={formId}
            onSubmit={(e) => {
              e.stopPropagation()
              e.preventDefault()
              form.handleSubmit()
            }}
            onReset={(e) => {
              e.stopPropagation()
              form.reset()
            }}
          >
            <Grid container spacing={3}>
              <Grid size={12}>
                <form.Field name="staff">
                  {(staffField) => {
                    const currentStaff = query.data?.rows.filter((row) =>
                      staffField.state.value.includes(row.id)
                    )

                    return (
                      <Autocomplete
                        value={currentStaff}
                        onChange={(_, value) => {
                          if (value) {
                            staffField.handleChange(value.map((i) => i.id))
                          } else {
                            staffField.handleChange([])
                          }
                        }}
                        multiple
                        options={query.data?.rows || []}
                        renderInput={(props) => <TextField {...props} fullWidth />}
                        loading={query.isPending}
                        getOptionLabel={(i) => i.name || ''}
                        getOptionKey={(i) => i.id}
                      />
                    )
                  }}
                </form.Field>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button type="submit" form={formId}>
            确定
          </Button>
          <Button onClick={handleClose}>取消</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const columnHelper = createColumnHelper<Invoice>()

const columns = [
  columnHelper.display({
    id: 'checkbox',
    header: (props) => (
      <Checkbox
        checked={props.table.getIsAllRowsSelected()}
        indeterminate={props.table.getIsSomeRowsSelected()}
        onChange={props.table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: (props) => (
      <Checkbox
        checked={props.row.getIsSelected()}
        onChange={props.row.getToggleSelectedHandler()}
      />
    ),
    footer: (props) => (
      <Checkbox
        checked={props.table.getIsAllRowsSelected()}
        indeterminate={props.table.getIsSomeRowsSelected()}
        onChange={props.table.getToggleAllRowsSelectedHandler()}
      />
    )
  }),
  columnHelper.accessor('id', {
    header: 'ID'
  }),
  columnHelper.accessor('code', {
    header: '发票号码'
  }),
  columnHelper.accessor('amount', {
    header: '价税合计'
  }),
  columnHelper.accessor('date', { header: '开票日期' }),
  columnHelper.accessor('staffToInvoice', {
    header: '人员',
    cell: (props) => (
      <Box display={'flex'} gap={1} flexWrap={'wrap'}>
        {props.getValue().map((staff) => (
          <Chip key={staff.staff.id} label={staff.staff.name} variant="outlined" size="small" />
        ))}
      </Box>
    )
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell(props) {
      return <StaffSelectDialog id={props.row.original.id} />
    }
  })
]

const ResultDialog = (props: DialogProps<React.PropsWithChildren>) => {
  return (
    <Dialog open={props.open} onClose={() => props.onClose()} fullWidth>
      <DialogTitle>计算结果</DialogTitle>
      <DialogContent>{props.payload.children}</DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose()}>确定</Button>
      </DialogActions>
    </Dialog>
  )
}

const tablePadding = new Map<string, TableCellProps['padding']>()
tablePadding.set('checkbox', 'checkbox')

export const Component: React.FC = () => {
  'use no memo'

  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(20)

  const dialog = useDialogs()
  const query = useQuery({
    ...fetchInvoice({
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
          <TableCell key={cell.id} padding={tablePadding.get(cell.column.id)}>
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
          title="发票管理"
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardContent>
          <Stack direction={'row'} flexWrap={'wrap'} useFlexGap gap={1}>
            <Button
              variant="outlined"
              onClick={() => {
                const rows = table.getSelectedRowModel().rows
                const staffs = [
                  ...new Set(rows.flatMap((i) => i.original.staffToInvoice.map((i) => i.staffId)))
                ]

                const map = new Map<number, string>()

                staffs.forEach((staff) => {
                  map.set(
                    staff,
                    rows
                      .filter((i) =>
                        i.original.staffToInvoice.some((staffToInvoice) =>
                          Object.is(staff, staffToInvoice.staffId)
                        )
                      )
                      .reduce((r, i) => {
                        return mathjs
                          .add(
                            mathjs.divide(
                              mathjs.bignumber(i.original.amount),
                              mathjs.bignumber(i.original.staffToInvoice.length)
                            ),
                            mathjs.bignumber(r)
                          )
                          .toString()
                      }, '0')
                  )
                })

                dialog.open(ResultDialog, {
                  children: (
                    <Table>
                      <TableHead>
                        <TableCell>STAFF</TableCell>
                        <TableCell>AMOUNT</TableCell>
                      </TableHead>
                      <TableBody>
                        {[...map.entries()].map((i) => (
                          <TableRow key={i[0]}>
                            <TableCell>{i[0]}</TableCell>
                            <TableCell>{i[1]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                })
              }}
              disabled={!table.getSelectedRowModel().rows.length}
            >
              计算
            </Button>
            <Button variant="outlined" startIcon={<AddOutlined />}>
              新增
            </Button>
          </Stack>
        </CardContent>
        {query.isFetching && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} padding={tablePadding.get(header.column.id)}>
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
                    <TableCell key={header.id} padding={tablePadding.get(header.column.id)}>
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
          onPageChange={(_, page) => setPageIndex(page)}
          onRowsPerPageChange={(e) => {
            setPageSize(Number.parseInt(e.target.value))
          }}
        />
      </Card>
    </Box>
  )
}
