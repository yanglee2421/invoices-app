import { createHashRouter, Outlet, RouterProvider } from 'react-router'
import React from 'react'
import { MUIProvider } from '@renderer/components/mui'
import { ReactRouterAppProvider } from '@toolpad/core/react-router'
import { NotificationsProvider, DialogsProvider, Navigation } from '@toolpad/core'
import { DashLayout } from '@renderer/components/layout'
import {
  AddOutlined,
  DashboardOutlined,
  GridViewOutlined,
  PeopleAltOutlined,
  ReceiptOutlined
} from '@mui/icons-material'

const BRANDING = { title: '报销MS' }

const NAVIGATION: Navigation = [
  {
    segment: '',
    title: '看板',
    icon: <DashboardOutlined />
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
    icon: <PeopleAltOutlined />,
    children: [
      {
        segment: '',
        title: '列表',
        icon: <GridViewOutlined />
      },
      {
        segment: 'new',
        title: '新增',
        icon: <AddOutlined />
      }
    ]
  },
  {
    segment: 'invoice',
    title: '发票',
    icon: <ReceiptOutlined />,
    children: [
      {
        segment: '',
        title: '列表',
        icon: <GridViewOutlined />
      },
      {
        segment: 'new',
        title: '新增',
        icon: <AddOutlined />
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
