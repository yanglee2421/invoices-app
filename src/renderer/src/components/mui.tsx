import React from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import 'dayjs/locale/zh'

const theme = createTheme({
  palette: { mode: 'dark' }
})

export const MUIProvider: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh">
        {props.children}
      </LocalizationProvider>
    </ThemeProvider>
  )
}
