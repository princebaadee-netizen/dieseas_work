import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { RequireAdmin } from '@/components/admin/RequireAdmin'
import {
  About,
  Categories,
  Category,
  Disease,
  Home,
  NotFound,
  Remedy,
  SearchResults,
} from '@/pages/public'
import {
  AdminCategories,
  AdminDashboard,
  AdminDiseaseForm,
  AdminDiseaseList,
  AdminErrorPage,
  AdminLogin,
  AdminRemedyForm,
  AdminRemedyList,
} from '@/pages/admin'
import {
  adminCategoriesLoader,
  adminDashboardLoader,
  adminDiseaseFormLoader,
  adminDiseasesLoader,
  adminRemedyFormLoader,
  adminRemedyListLoader,
} from './loaders'

/**
 * The web addresses and which page each one opens
 * (Project Plan section 2.1 and the Routes folder in section 2.4).
 *
 * The route list is exported separately so the checks can build the same
 * routes in memory, rather than testing a copy of them.
 */
export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <SearchResults /> },
      { path: 'disease/:name', element: <Disease /> },
      { path: 'disease/:name/remedy', element: <Remedy /> },
      { path: 'categories', element: <Categories /> },
      { path: 'category/:name', element: <Category /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },

  // The admin login sits outside the admin frame.
  { path: '/admin/login', element: <AdminLogin /> },

  // The admin area, behind the placeholder guard.
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    errorElement: <AdminErrorPage />,
    children: [
      { index: true, element: <AdminDashboard />, loader: adminDashboardLoader },
      { path: 'diseases', element: <AdminDiseaseList />, loader: adminDiseasesLoader },
      { path: 'diseases/new', element: <AdminDiseaseForm />, loader: adminDiseaseFormLoader },
      { path: 'diseases/:id/edit', element: <AdminDiseaseForm />, loader: adminDiseaseFormLoader },
      { path: 'remedies', element: <AdminRemedyList />, loader: adminRemedyListLoader },
      { path: 'remedies/new', element: <AdminRemedyForm />, loader: adminRemedyFormLoader },
      { path: 'remedies/:id/edit', element: <AdminRemedyForm />, loader: adminRemedyFormLoader },
      { path: 'categories', element: <AdminCategories />, loader: adminCategoriesLoader },
    ],
  },
]

/** The live router the app runs on. */
export const router = createBrowserRouter(routes)
