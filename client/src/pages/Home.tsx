import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') nav('/admin/dashboard', { replace: true });
      else nav('/places', { replace: true });
    }
  }, [user, nav]);

  // Chỉ hiển thị landing khi CHƯA đăng nhập
  if (user) return null;

  return (
    <div className="max-w-5xl mx-auto p-8 text-center space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold">Chào mừng đến Đà Lạt Travel</h1>
      <p className="opacity-80">
        Khám phá địa điểm đẹp, đọc review, đặt chỗ nhanh chóng. Bắt đầu bằng cách xem danh sách địa điểm.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/places" className="btn btn-primary">Xem địa điểm</Link>
        <Link to="/login" className="btn">Đăng nhập</Link>
      </div>
    </div>
  );
}
