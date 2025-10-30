import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import CreateEvent from './pages/CreateEvent';
import ManageEvents from './pages/ManageEvents';
import EditEvent from './pages/EditEvent';
import AuthCallback from './pages/AuthCallback';

function App() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
              <h1>🎫 Eventopia</h1>
            </Link>
            <nav className="nav-links">
              <Link to="/">Events</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/my-bookings">My Bookings</Link>
                  {isAdmin && (
                    <>
                      <Link to="/manage-events">Manage Events</Link>
                      <Link to="/create-event">Create Event</Link>
                    </>
                  )}
                  <span>Welcome, {user?.name}</span>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-event" 
            element={
              <AdminRoute>
                <CreateEvent />
              </AdminRoute>
            } 
          />
          <Route 
            path="/manage-events" 
            element={
              <AdminRoute>
                <ManageEvents />
              </AdminRoute>
            } 
          />
          <Route 
            path="/edit-event" 
            element={
              <AdminRoute>
                <EditEvent />
              </AdminRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
