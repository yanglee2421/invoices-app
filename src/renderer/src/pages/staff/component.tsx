import {
  Box,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Table,
  TableBody,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination
} from '@mui/material'
import React from 'react'

export const Component: React.FC = () => {
  return (
    <Box padding={3}>
      <Card>
        <CardHeader />
        <CardContent></CardContent>
        <LinearProgress />
        <TableContainer>
          <Table>
            <TableHead></TableHead>
            <TableBody></TableBody>
            <TableFooter></TableFooter>
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
