import {
  ArrowUpwardOutlined,
  DeleteOutlined,
  InsertDriveFileOutlined,
  LinkOutlined
} from '@mui/icons-material'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField
} from '@mui/material'
import { queryOptions, useQueries } from '@tanstack/react-query'
import React from 'react'
import * as pdfjs from 'pdfjs-dist'
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader'
import wasmURL from 'zxing-wasm/reader/zxing_reader.wasm?url'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { z } from 'zod'
import { useDialogs, useNotifications } from '@toolpad/core'
import { useInvoiceNew, InvoiceInsertPayload } from '@renderer/api/invoice'

prepareZXingModule({
  overrides: {
    locateFile(path: string, prefix: string) {
      if (path.endsWith('.wasm')) {
        return new URL(wasmURL, import.meta.url).href
      }
      return prefix + path
    }
  }
})
pdfjs.GlobalWorkerOptions.workerSrc = new URL(pdfWorker, import.meta.url).href

const fileToFileId = (file: File) => [file.lastModified, file.name, file.size, file.type].join()

const pdfToImageBlob = async (file: File, pageIndex = 1) => {
  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const page = await doc.getPage(pageIndex)
  const viewport = page.getViewport({ scale: 1 })
  const outputScale = devicePixelRatio || 1
  const canvas = document.createElement('canvas')
  const canvasContext = canvas.getContext('2d')
  if (!canvasContext) throw new Error('get canvas context failed')

  canvas.width = Math.floor(viewport.width * outputScale)
  canvas.height = Math.floor(viewport.height * outputScale)

  await page.render({
    viewport,
    canvasContext,
    transform: Object.is(outputScale, 1) ? void 0 : [outputScale, 0, 0, outputScale, 0, 0]
  }).promise

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('get blob from canvas failed')
      }
      resolve(blob)
    })
  })

  return blob
}

const pdfDataSchema = z.object({
  code: z.string().min(1),
  amount: z.string().min(1),
  date: z.string().min(1)
})

const barcodeTextToInvocie = (barcodeText: string) => {
  try {
    const list = barcodeText.split(',')
    return pdfDataSchema.parse({
      code: list.at(3),
      amount: list.at(4),
      date: list.at(5)
    })
  } catch {
    return null
  }
}

const fetchPDF = (file: File) =>
  queryOptions({
    queryKey: ['pdf', file.lastModified, file.name, file.size, file.type],
    async queryFn() {
      const blob = await pdfToImageBlob(file)
      const barcodes = await readBarcodes(blob)
      const invoices = barcodes.map((i) => barcodeTextToInvocie(i.text))

      return {
        invoices,
        blob
      }
    }
  })

export const Component: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([])

  const queries = useQueries({
    queries: files.map((file) => fetchPDF(file))
  })
  const dialog = useDialogs()
  const create = useInvoiceNew()
  const toast = useNotifications()

  return (
    <Box padding={3}>
      <Card>
        <CardHeader
          title="发票录入"
          action={
            <IconButton
              onClick={async () => {
                const data: InvoiceInsertPayload = queries
                  .map((i) => {
                    if (!i.data) return false
                    const item = i.data.invoices.at(0)
                    if (!item) return false
                    return item
                  })
                  .filter((i) => typeof i === 'object')
                create.mutate(data, {
                  onSuccess() {
                    toast.show('新增成功', { severity: 'success' })
                  },
                  onError(error) {
                    toast.show(error.message, { severity: 'error' })
                  }
                })
              }}
              disabled={create.isPending}
            >
              <ArrowUpwardOutlined />
            </IconButton>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                onPaste={(e) => {
                  setFiles((prev) => {
                    const allFiles = prev.concat([...e.clipboardData.files])

                    const fileMap = new Map<string, File>()
                    for (const file of allFiles) {
                      fileMap.set(fileToFileId(file), file)
                    }
                    return [...fileMap.values()]
                  })
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  setFiles((prev) => {
                    const allFiles = prev.concat([...e.dataTransfer.files])

                    const fileMap = new Map<string, File>()
                    for (const file of allFiles) {
                      fileMap.set(fileToFileId(file), file)
                    }
                    return [...fileMap.values()]
                  })
                }}
                placeholder="粘贴或拖拽PDF文件到此处..."
                fullWidth
                minRows={2}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton component="label">
                          <input
                            hidden
                            type="file"
                            value={''}
                            onChange={(e) => {
                              setFiles((prev) => {
                                const files = e.target.files ? [...e.target.files] : []
                                const allFiles = prev.concat(files)

                                const fileMap = new Map<string, File>()
                                for (const file of allFiles) {
                                  fileMap.set(fileToFileId(file), file)
                                }
                                return [...fileMap.values()]
                              })
                            }}
                            multiple
                            accept="application/pdf"
                          />
                          <LinkOutlined />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={12}>
              <List>
                {files.map((file) => (
                  <ListItem
                    key={fileToFileId(file)}
                    secondaryAction={
                      <IconButton
                        onClick={async () => {
                          const confirmed = await dialog.confirm('确认删除吗？', {
                            title: '警告',
                            severity: 'error',
                            okText: '确认',
                            cancelText: '取消'
                          })
                          if (confirmed) {
                            setFiles((prev) => prev.filter((i) => !Object.is(file, i)))
                          }
                        }}
                        color="error"
                      >
                        <DeleteOutlined />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <InsertDriveFileOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={new Date(file.lastModified).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            {queries.map((i, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                {(() => {
                  if (i.isPending) {
                    return <CircularProgress />
                  }

                  if (i.isError) {
                    return null
                  }

                  const imgHref = URL.createObjectURL(i.data.blob)

                  return (
                    <figure>
                      <img
                        src={imgHref}
                        onLoad={() => {
                          URL.revokeObjectURL(imgHref)
                        }}
                        alt=""
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: '100%'
                        }}
                      />
                      <figcaption
                        style={{
                          textWrap: 'wrap',
                          wordBreak: 'break-all'
                        }}
                      >
                        {i.data.invoices.at(0)?.code}
                      </figcaption>
                    </figure>
                  )
                })()}
              </Grid>
            ))}
          </Grid>
        </CardContent>
        <CardActions></CardActions>
      </Card>
    </Box>
  )
}
