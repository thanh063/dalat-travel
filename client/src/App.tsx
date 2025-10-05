import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import PlacesList from './pages/PlacesList';
import PlaceDetail from './pages/PlaceDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { AdminPlacesList, AdminPlaceNew, AdminPlaceEdit } from './pages/admin';
import Dashboard from './pages/admin/Dashboard';
import { Checkout, Success, Cancel } from './pages/Payments';
import Home from './pages/Home';

function AdminRoutes() {
  return (
    <ProtectedRoute role="ADMIN">
      <div className="p-2">
        <Routes>
          <Route index element={<Navigate to="dashboard" replace/>}/>
          <Route path="dashboard" element={<Dashboard/>}/>
          <Route path="places" element={<AdminPlacesList/>}/>
          <Route path="places/new" element={<AdminPlaceNew/>}/>
          <Route path="places/:id/edit" element={<AdminPlaceEdit/>}/>
        </Routes>
      </div>
    </ProtectedRoute>
  );
}

function Shell() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home/>} />   {/* Trang chủ xuất hiện đầu tiên */}
        <Route path="/places" element={<PlacesList/>}/>
        <Route path="/places/:slug" element={<PlaceDetail/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/admin/*" element={<AdminRoutes/>}/>
        {/* payments giữ nguyên */}
        <Route path="*" element={<div className="p-6">Không tìm thấy trang</div>} />
      </Routes>
    </>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
