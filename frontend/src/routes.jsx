import { useRoutes } from 'react-router'
import Home from './pages/Home';
import Auth from './pages/Auth';
import Lobby from './pages/Lobby';
import AuthSuccess from './components/auth/AuthSuccess';

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
    element: <AuthSuccess />,
  },
  {
    path: '*',
    element: <>Not found</>,
  },
];

export default function RoutesWrapper() {
  return useRoutes(routes);
}