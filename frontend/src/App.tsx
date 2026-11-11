import { RouterProvider } from 'react-router-dom'
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider'
import { router } from '@/routes/router'

export default function App() {
  return (
    <AdminAuthProvider>
      <RouterProvider router={router} />
    </AdminAuthProvider>
  )
}
