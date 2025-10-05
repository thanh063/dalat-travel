import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const { login } = useAuth();
  const [email, setEmail] = useState('');          // KHÔNG điền sẵn
  const [password, setPassword] = useState('');
  const msgFromRegister = (loc.state as any)?.msg;
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
     try {
    const u = await login(email, password);
    // Ưu tiên state.from (nếu đang bị chặn bởi ProtectedRoute)
    const from = (loc.state as any)?.from as string | undefined;

    if (from) {
      nav(from, { replace: true });
    } else if (u.role === 'ADMIN') {
      nav('/admin/dashboard', { replace: true });
    } else {
      nav('/places', { replace: true });
    }
  } catch (ex: any) {
    const msg = ex?.response?.data?.message || 'Đăng nhập thất bại';
    setErr(msg);
  } finally {
    setLoading(false);
  }}

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập</h1>
      {err && <div className="alert alert-error mb-3">{err}</div>}
      <form className="grid gap-3" onSubmit={submit}>
        <input className="input input-bordered" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input input-bordered" type="password" placeholder="Mật khẩu"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <button className={`btn btn-primary ${loading ? 'loading' : ''}`}>Đăng nhập</button>
      </form>
      <p className="mt-3 text-sm">Chưa có tài khoản? <Link className="link" to="/register">Đăng ký</Link></p>
    </div>
  );
}
