import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const ScorePage = lazy(() => import('./pages/ScorePage'));
const CharityListPage = lazy(() => import('./pages/CharityListPage'));
const CharityDetailPage = lazy(() => import('./pages/CharityDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const PageLoader = () => <div className="flex min-h-[60vh] items-center justify-center text-slate-300">Loading...</div>;

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/charities" element={<CharityListPage />} />
          <Route path="/charities/:slug" element={<CharityDetailPage />} />
          <Route path="/score-center" element={<ScorePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subscribe" element={<SubscriptionPage />} />
          </Route>
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
