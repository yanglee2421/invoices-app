import React from 'react'
import { DashboardLayout } from '@toolpad/core'
import { Outlet } from 'react-router'

export const DashLayout: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
