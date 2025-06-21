import { createHashRouter, Outlet, RouterProvider } from 'react-router'
import React from 'react'
import { MUIProvider } from '@renderer/components/mui'
import { ReactRouterAppProvider } from '@toolpad/core/react-router'
import { NotificationsProvider, DialogsProvider, Navigation } from '@toolpad/core'
import { DashLayout } from '@renderer/components/layout'

const BRANDING = { title: 'App' }

const NAVIGATION: Navigation = [
  {
    segment: 'haha'
  },
  {
    kind: 'divider'
  },
  {
    kind: 'header',
    title: 'App'
  },
  {
    segment: 'invoice',
    children: [
      {
        segment: 'list'
      },
      {
        segment: 'add'
      }
    ]
  }
]

const RootRoute: React.FC = () => {
  return (
    <MUIProvider>
      <ReactRouterAppProvider branding={BRANDING} navigation={NAVIGATION}>
        <NotificationsProvider
          slotProps={{
            snackbar: {
              anchorOrigin: { horizontal: 'center', vertical: 'top' },
              autoHideDuration: 1000 * 3
            }
          }}
        >
          <DialogsProvider>
            <Outlet />
          </DialogsProvider>
        </NotificationsProvider>
      </ReactRouterAppProvider>
    </MUIProvider>
  )
}

const router = createHashRouter([
  {
    id: 'root',
    Component: RootRoute,
    children: [
      {
        id: 'dashLayout',
        Component: DashLayout,
        children: [
          {
            id: 'home',
            index: true,
            lazy: () => import('@renderer/pages/home/component')
          }
        ]
      }
    ]
  }
])

export const Root: React.FC = () => {
  return <RouterProvider router={router} />
}
