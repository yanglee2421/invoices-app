import { createHashRouter, Outlet, RouterProvider } from 'react-router'
import React from 'react'
import { MUIProvider } from '@renderer/components/mui'
import { ReactRouterAppProvider } from '@toolpad/core/react-router'
import { NotificationsProvider, DialogsProvider, Navigation } from '@toolpad/core'
import { DashLayout } from '@renderer/components/layout'

const BRANDING = { title: 'App' }

const NAVIGATION: Navigation = [
  {
    segment: '',
    title: '看板'
  },
  {
    kind: 'divider'
  },
  {
    kind: 'header',
    title: '应用'
  },
  {
    segment: 'staff',
    title: '员工',
    children: [
      {
        segment: '',
        title: '列表'
      },
      {
        segment: 'new',
        title: '新增'
      }
    ]
  },
  {
    segment: 'invoice',
    title: '发票',
    children: [
      {
        segment: '',
        title: '列表'
      },
      {
        segment: 'new',
        title: '新增'
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
    Component: RootRoute,
    children: [
      {
        Component: DashLayout,
        children: [
          {
            index: true,
            lazy: () => import('@renderer/pages/home/component')
          },
          {
            path: 'invoice',
            children: [
              {
                index: true,
                lazy: () => import('@renderer/pages/invoice/component')
              },
              {
                path: 'new',
                lazy: () => import('@renderer/pages/invoice_new/component')
              }
            ]
          },
          {
            path: 'staff',
            children: [
              {
                index: true,
                lazy: () => import('@renderer/pages/staff/component')
              },
              {
                path: 'new',
                lazy: () => import('@renderer/pages/staff_new/component')
              }
            ]
          }
        ]
      }
    ]
  }
])

export const Root: React.FC = () => {
  return <RouterProvider router={router} />
}
