import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type TopPlace = { id:string; name:string; rating:number; ratingCount:number; price:number; slug:string };
type LatestBooking = {
  id:string; status:'PENDING'|'PAID'|'CANCELLED'; total:number; createdAt:string;
  user:{ id:string; fullName:string; email:string };
  place:{ id:string; name:string; slug:string };
};

export default function Dashboard(){
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [data, setData] = useState<{
    totalPlaces: number;
    totalBookings: number;
    pendingBookings: number;
    revenueThisMonth: number;
    topPlaces: TopPlace[];
    latestBookings: LatestBooking[];
    monthStart: string;
  } | null>(null);

  const [chart, setChart] = useState<{label:string; total:number}[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        const [ov, ch] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/revenue-by-month')
        ]);
        setData(ov.data);
        setChart(ch.data);
      } catch (e:any) {
        setErr(e?.response?.data?.message || 'Không tải được số liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      {err && <div className="alert alert-error">{err}</div>}

      <div className="grid md:grid-cols-4 gap-4">
        <Kpi title="Địa điểm" value={data?.totalPlaces ?? 0} />
        <Kpi title="Đơn đặt chỗ" value={data?.totalBookings ?? 0} />
        <Kpi title="Đơn đang chờ" value={data?.pendingBookings ?? 0} />
        <Kpi title={`Doanh thu tháng (${new Date(data!.monthStart).toLocaleDateString()})`} value={(data?.revenueThisMonth ?? 0).toLocaleString() + ' đ'} />
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Doanh thu 12 tháng gần nhất</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(v:number)=>v.toLocaleString() + ' đ'} />
                <Line type="monotone" dataKey="total" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Top địa điểm</h2>
              <Link to="/admin/places" className="btn btn-sm">Quản lý</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Tên</th><th>⭐ Rating</th><th>Giá</th><th></th></tr>
                </thead>
                <tbody>
                  {data?.topPlaces?.map(p => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td>⭐ {p.rating.toFixed(1)} ({p.ratingCount})</td>
                      <td>{p.price.toLocaleString()} đ</td>
                      <td><Link to={`/places/${p.slug}`} className="link">Xem</Link></td>
                    </tr>
                  )) || null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Đặt chỗ mới nhất</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Thời gian</th><th>Khách</th><th>Địa điểm</th><th>Trạng thái</th><th>Tổng</th></tr>
                </thead>
                <tbody>
                  {data?.latestBookings?.map(b => (
                    <tr key={b.id}>
                      <td>{new Date(b.createdAt).toLocaleString()}</td>
                      <td>{b.user.fullName}</td>
                      <td><Link to={`/places/${b.place.slug}`} className="link">{b.place.name}</Link></td>
                      <td><span className={`badge ${badgeClass(b.status)}`}>{b.status}</span></td>
                      <td>{b.total.toLocaleString()} đ</td>
                    </tr>
                  )) || null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="stat bg-base-100 rounded-xl shadow">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-primary">{value}</div>
    </div>
  );
}

function badgeClass(status: LatestBooking['status']) {
  switch (status) {
    case 'PAID': return 'badge-success';
    case 'PENDING': return 'badge-warning';
    case 'CANCELLED': return 'badge-ghost';
    default: return '';
  }
}
