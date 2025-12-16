import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import GameThreads from './pages/GameThreads';
import GameThreadDetail from './pages/GameThreadDetail';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import PostDetail from './pages/PostDetail';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has completed onboarding
  const hasFavoriteTeams = user?.favorite_teams && Array.isArray(user.favorite_teams) && user.favorite_teams.length > 0;

  if (!hasFavoriteTeams) {
    return <Navigate to="/onboarding" />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const hasFavoriteTeams = user?.favorite_teams && Array.isArray(user.favorite_teams) && user.favorite_teams.length > 0;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated && hasFavoriteTeams ? (
            <Navigate to="/" />
          ) : isAuthenticated ? (
            <Navigate to="/onboarding" />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated && hasFavoriteTeams ? (
            <Navigate to="/" />
          ) : isAuthenticated ? (
            <Navigate to="/onboarding" />
          ) : (
            <Register />
          )
        }
      />
      <Route
        path="/onboarding"
        element={
          isAuthenticated ? (
            hasFavoriteTeams ? <Navigate to="/" /> : <Onboarding />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <GameThreads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/:id"
        element={
          <ProtectedRoute>
            <GameThreadDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
