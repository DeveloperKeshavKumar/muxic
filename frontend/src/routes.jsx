import { useRoutes } from 'react-router'
import Home from './pages/Home';
import Auth from './pages/Auth';
import Lobby from './pages/Lobby';
import { OAuthSuccess, OAuthError } from './components/auth/OAuth';

const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/lobby',
    element: <Lobby />,
  },
  {
    path: '/login',
    element: <Auth type={'login'} />,
  },
  {
    path: '/register',
    element: <Auth type={'register'} />,
  },
  {
    path: '/verify',
    element: <Auth type={'verify'} />,
  },
  {
    path: '/forgot-password',
    element: <Auth type={'forgot-password'} />,
  },
  {
    path: '/reset-password',
    element: <Auth type={'reset-password'} />,
  },
  {
    path: '/auth/success',
    element: <OAuthSuccess />,
  },
  {
    path: '/auth/error',
    element: <OAuthError />,
  },
  {
    path: '*',
    element: <>Not found</>,
  },
];

export default function RoutesWrapper() {
  return useRoutes(routes);
}