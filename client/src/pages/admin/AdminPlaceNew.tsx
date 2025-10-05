import { useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

export default function AdminPlaceNew() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name:'', address:'', price:0, description:'', tags:'', imageUrl:'' });
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  async function onUpload(e:any){
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/uploads/image', fd); // KHÔNG set Content-Type thủ công
      setForm(f => ({ ...f, imageUrl: r.data.url }));
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }

  async function submit(e:any){ 
    e.preventDefault();
    setErr('');
    try {
      await api.post('/places', form);
      nav('/admin/places');
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Lưu thất bại');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Thêm địa điểm</h1>
      {err && <div className="alert alert-error mb-3">{err}</div>}
      <form className="grid gap-3" onSubmit={submit}>
        <input className="input input-bordered" placeholder="Tên" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="input input-bordered" placeholder="Địa chỉ" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
        <input className="input input-bordered" type="number" placeholder="Giá" value={form.price} onChange={e=>setForm({...form,price:parseInt(e.target.value||'0')})}/>
        <textarea className="textarea textarea-bordered" placeholder="Mô tả" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input className="input input-bordered" placeholder="Tag (ví dụ: cảnh quan, sống ảo)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/>

        <div className="flex items-center gap-3">
          <input type="file" className="file-input file-input-bordered" onChange={onUpload} />
          {uploading && <span className="loading loading-spinner loading-sm" />}
          {form.imageUrl && <img src={form.imageUrl} className="h-12 rounded" />}
        </div>

        <button className="btn btn-primary">Lưu</button>
      </form>
    </div>
  );
}
