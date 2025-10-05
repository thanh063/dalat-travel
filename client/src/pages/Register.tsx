import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.post('/auth/register', { fullName, email, password });
      // Không auto login; chuyển sang /login
      nav('/login', { replace: true, state: { msg: 'Tạo tài khoản thành công, vui lòng đăng nhập.' } });
    } catch (ex: any) {
      setErr(ex?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Đăng ký</h1>
      {err && <div className="alert alert-error mb-3">{err}</div>}
      <form className="grid gap-3" onSubmit={submit}>
        <input className="input input-bordered" placeholder="Họ tên" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input className="input input-bordered" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input input-bordered" type="password" placeholder="Mật khẩu (≥ 6 ký tự)" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className={`btn btn-primary ${loading ? 'loading' : ''}`}>Tạo tài khoản</button>
      </form>
      <p className="mt-3 text-sm">
        Đã có tài khoản? <Link className="link" to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}
