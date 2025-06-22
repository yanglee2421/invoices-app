import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { db } from './db'
import * as schema from './schema'
import * as sql from 'drizzle-orm'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

type InvoiceSelectPayload = {
  code?: string
  amount?: string
  date?: string
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('invoice', async (_, payload: InvoiceSelectPayload) => {
  try {
    console.log('invoice')

    const wheres = [
      payload.code && sql.eq(schema.invoice.code, `%${payload.code}%`),
      payload.amount && sql.like(schema.invoice.amount, `%${payload.amount}%`),
      payload.date && sql.like(schema.invoice.date, `%${payload.date}%`)
    ].filter((i) => typeof i === 'object')

    const [{ total }] = await db
      .select({ total: sql.count() })
      .from(schema.invoice)
      .where(sql.and(...wheres))
    const rows = await db
      .select()
      .from(schema.invoice)
      .where(sql.and(...wheres))
    return { total, rows }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message
    }

    throw String(error)
  }
})

type InvoiceInsertPayload = {
  code: string
  amount: string
  date: string
}

ipcMain.handle('invoice:new', async (_, payload: InvoiceInsertPayload) => {
  try {
    const data = await db.insert(schema.invoice).values(payload).returning()
    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error.message
    }

    throw String(error)
  }
})
