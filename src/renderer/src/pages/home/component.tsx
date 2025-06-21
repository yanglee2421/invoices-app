import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField
} from '@mui/material'
import React from 'react'
import { useForm } from '@tanstack/react-form'
import { KeyboardArrowUpOutlined, LinkOutlined } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { z } from 'zod'

const schema = z.object({
  files: z.array(z.instanceof(File))
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  files: []
}

export const Component: React.FC = () => {
  const formId = React.useId()
  const fileInputId = React.useId()

  const form = useForm({
    defaultValues,
    onSubmit({ value }) {
      console.log(value)
    },
    validators: {
      onChange: schema
    }
  })

  return (
    <Stack spacing={3} padding={3}>
      <Card>
        <CardHeader title="Add" />
        <CardContent>
          <form
            id={formId}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            onReset={() => form.reset()}
          >
            <Grid container spacing={3}>
              <Grid size={12}>
                <FormLabel>主题</FormLabel>
              </Grid>
              <Grid size={12}>
                <TextField fullWidth />
              </Grid>
              <Grid size={12}>
                <FormLabel>时间区间</FormLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DatePicker
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DatePicker
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <FormLabel>发票</FormLabel>
              </Grid>
              <Grid size={12}>
                <form.Field name="files">
                  {(filesField) => (
                    <TextField
                      onPaste={(e) => {
                        filesField.handleChange([...e.clipboardData.files])
                      }}
                      multiline
                      fullWidth
                      minRows={3}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton>
                                <KeyboardArrowUpOutlined />
                              </IconButton>
                            </InputAdornment>
                          ),
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconButton component="label" htmlFor={fileInputId}>
                                <Box display={'none'}>
                                  <input
                                    type="file"
                                    multiple
                                    id={fileInputId}
                                    accept="application/pdf"
                                    value={''}
                                    onChange={(e) => {
                                      filesField.handleChange(
                                        e.currentTarget.files ? [...e.currentTarget.files] : []
                                      )
                                    }}
                                  />
                                </Box>
                                <LinkOutlined />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                </form.Field>
              </Grid>
            </Grid>
          </form>
        </CardContent>
        <CardActions>
          <Button type="submit" form={formId}>
            Submit
          </Button>
          <Button type="reset" form={formId}>
            Reset
          </Button>
        </CardActions>
      </Card>
    </Stack>
  )
}
