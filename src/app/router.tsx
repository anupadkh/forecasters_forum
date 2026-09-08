import { lazy, Suspense, type LazyExoticComponent } from 'react';
import {
  type RouteObject,
  createBrowserRouter,
  redirect,
  useRouteError,
} from 'react-router-dom';

import Layout from '../components/Layout';
import { hasActiveSession } from '../features/auth/session';

const DashboardPage = lazy(() => import('../pages/dashboard/Dashboard'));
const ButtonsPage = lazy(() => import('../pages/buttons/Buttons'));
const ChartsPage = lazy(() => import('../pages/charts/Charts'));
const MapsPage = lazy(() => import('../pages/google/Google'));
const IconsPage = lazy(() => import('../pages/icons/Icons'));
const NotificationsPage = lazy(() => import('../pages/notifications/Notifications'));
const TablesPage = lazy(() => import('../pages/tables/Tables'));
const TypographyPage = lazy(() => import('../pages/typography/Typography'));
const LoginPage = lazy(() => import('../pages/login/Login'));
const RegisterPage = lazy(() => import('../pages/register/Register'));
const ProfilePage = lazy(() => import('../pages/profile/Profile'));
const PrivacyPage = lazy(() => import('../pages/privacy/Privacy'));
const PostListPage = lazy(() => import('../pages/posts/list/PostList'));
const PostNewPage = lazy(() => import('../pages/posts/new/PostNew'));
const NotFoundPage = lazy(() => import('../pages/notFound/NotFound'));
const TermsPage = lazy(() => import('../pages/terms/Terms'));
const BulletinPage = lazy(() => import('../pages/bulletin/Bulletin'));
const BulletinListPage = lazy(() => import('../pages/bulletin/List'));
const BulletinReportPage = lazy(() => import('../pages/bulletin-report/grid'));
const BulletinDesignerPage = lazy(() => import('../pages/bulletin-report/designer'));

const routeLoader =
  (predicate: () => boolean, targetPath: string) =>
  async () => {
    if (predicate()) {
      return redirect(targetPath);
    }

    return null;
  };

const rootRedirectLoader = async () => redirect(hasActiveSession() ? '/app/bulletin/list' : '/login');

const PageFallback = () => (
  <div className="d-flex min-vh-100 align-items-center justify-content-center">
    <div className="text-center">
      <div className="spinner-border text-danger" role="status" />
      <p className="mt-3 mb-0 text-muted">Loading dashboard module...</p>
    </div>
  </div>
);

const renderLazyPage = (Page: LazyExoticComponent<() => React.JSX.Element>) => (
  <Suspense fallback={<PageFallback />}>
    <Page />
  </Suspense>
);

const RouteErrorBoundary = () => {
  const routeError = useRouteError();
  const message =
    routeError instanceof Error ? routeError.message : 'Unexpected routing error';

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center p-4">
      <div className="text-center">
        <h1 className="display-6 mb-3">Something broke</h1>
        <p className="text-muted mb-4">{message}</p>
        <a className="btn btn-danger" href={`${import.meta.env.BASE_URL}app/main`}>
          Go back to the dashboard
        </a>
      </div>
    </div>
  );
};

export const routes: RouteObject[] = [
  {
    path: '/',
    loader: rootRedirectLoader,
  },
  {
    path: '/login',
    loader: routeLoader(hasActiveSession, '/app/main'),
    element: renderLazyPage(LoginPage),
  },
  {
    path: '/register',
    loader: routeLoader(hasActiveSession, '/app/main'),
    element: renderLazyPage(RegisterPage),
  },
  {
    path: '/app',
    loader: routeLoader(() => !hasActiveSession(), '/login'),
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, loader: async () => redirect('/app/bulletin/list') },
      { path: 'main', element: renderLazyPage(DashboardPage) },
      { path: 'bulletin', element: renderLazyPage(BulletinPage) },
      { path: 'bulletin/list', element: renderLazyPage(BulletinListPage) },
      { path: 'bulletin/designer', element: renderLazyPage(BulletinDesignerPage) },
      { path: 'bulletin/report', element: renderLazyPage(BulletinReportPage) },
      { path: 'typography', element: renderLazyPage(TypographyPage) },
      { path: 'tables', element: renderLazyPage(TablesPage) },
      { path: 'notifications', element: renderLazyPage(NotificationsPage) },
      { path: 'components/buttons', element: renderLazyPage(ButtonsPage) },
      { path: 'components/charts', element: renderLazyPage(ChartsPage) },
      { path: 'components/icons', element: renderLazyPage(IconsPage) },
      { path: 'components/maps', element: renderLazyPage(MapsPage) },
      { path: 'posts', element: renderLazyPage(PostListPage) },
      { path: 'posts/new', element: renderLazyPage(PostNewPage) },
      { path: 'profile', element: renderLazyPage(ProfilePage) },
      { path: 'privacy', element: renderLazyPage(PrivacyPage) },
      { path: 'tos', element: renderLazyPage(TermsPage) },
      { path: '*', element: renderLazyPage(NotFoundPage) },
    ],
  },
  {
    path: '*',
    element: renderLazyPage(NotFoundPage),
  },
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});
