import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  TextField
} from '@mui/material'
import { useStaffNew } from '@renderer/api/staff'
import { useForm } from '@tanstack/react-form'
import { useNotifications } from '@toolpad/core'
import React from 'react'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1)
})

export const Component: React.FC = () => {
  const formId = React.useId()

  const toast = useNotifications()
  const create = useStaffNew()

  const form = useForm({
    defaultValues: {
      name: ''
    },
    async onSubmit({ value, formApi }) {
      create.mutateAsync([value], {
        onError(error) {
          toast.show(error.message, {
            severity: 'error'
          })
        },
        onSuccess() {
          formApi.reset()
          toast.show('操作成功', { severity: 'success' })
        }
      })
    },
    validators: {
      onChange: schema
    }
  })

  return (
    <Box padding={3}>
      <Card>
        <CardHeader title="添加人员" />
        <CardContent>
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
            noValidate
            autoComplete="off"
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <form.Field name="name">
                  {(nameField) => (
                    <TextField
                      value={nameField.state.value}
                      onChange={(e) => {
                        nameField.handleChange(e.target.value)
                      }}
                      onBlur={nameField.handleBlur}
                      fullWidth
                      label="名称"
                    />
                  )}
                </form.Field>
              </Grid>
            </Grid>
          </form>
        </CardContent>
        <CardActions>
          <Button form={formId} type="submit">
            保存
          </Button>
          <Button form={formId} type="reset">
            重置
          </Button>
        </CardActions>
      </Card>
    </Box>
  )
}
