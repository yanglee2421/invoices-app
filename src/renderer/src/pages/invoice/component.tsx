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
  Grid,
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
  TextField,
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
import { EditOutlined, RefreshOutlined } from '@mui/icons-material'
import { Staff } from '@main/schema'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useDialogs, useNotifications, DialogProps } from '@toolpad/core'
import * as mathjs from 'mathjs'

type StaffToInvoice = {
  staffId: number
  invoiceId: number
  staff: {
    id: number
    name: string | null
    alias: null
    enableAlias: null
  }
}

type Invoice = {
  id: number
  code: string | null
  amount: string | null
  date: string | null
  staffToInvoice: StaffToInvoice[]
}

const fetchInvoice = () => {
  return queryOptions({
    queryKey: ['invoice'],
    queryFn() {
      return window.electron.ipcRenderer.invoke('invoice', {}) as unknown as {
        total: number
        rows: Invoice[]
      }
    }
  })
}

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
  columnHelper.accessor('id', {}),
  columnHelper.accessor('code', {}),
  columnHelper.accessor('amount', {}),
  columnHelper.accessor('date', {}),
  columnHelper.accessor('staffToInvoice', {
    cell: (props) => (
      <>
        {props.getValue().map((staff) => (
          <Chip key={staff.staff.id} label={staff.staff.name} variant="outlined" />
        ))}
      </>
    )
  }),
  columnHelper.display({
    id: 'actions',
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

export const Component: React.FC = () => {
  'use no memo'
  const dialog = useDialogs()
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
            <IconButton onClick={() => query.refetch()}>
              <RefreshOutlined />
            </IconButton>
          }
          title="发票管理"
        />
        <CardContent>
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
        </CardContent>
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
