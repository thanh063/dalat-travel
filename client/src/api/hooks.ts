import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

// ---------- AUTH ----------
export type Me = { id: string; fullName: string; email: string; role: 'ADMIN' | 'USER' };

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data as Me;
    },
    retry: false,
  });

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', payload);
      return data as { token: string; user: Me };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
};

export const useRegister = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { fullName: string; email: string; password: string }) => {
      const { data } = await api.post('/auth/register', payload);
      return data as { token: string; user: Me };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout'); // nếu BE không có, bạn có thể chỉ xóa token ở client
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
};

// ---------- PLACES ----------
export type Place = {
  id: string;
  slug: string;
  name: string;
  address?: string | null;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  tags: { id: string; name: string }[];
};

export const usePlaces = (params: { page: number; pageSize: number; search?: string; sort?: string }) =>
  useQuery({
    queryKey: ['places', params],
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set('page', String(params.page));
      search.set('pageSize', String(params.pageSize));
      if (params.search) search.set('search', params.search);
      if (params.sort) search.set('sort', params.sort);
      const { data } = await api.get(`/places?${search.toString()}`);
      return data as { data: Place[]; total: number; page: number; pageSize: number };
    },
  });

export const useDeletePlace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/places/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['places'] }),
  });
};

export const useCreatePlace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await api.post('/places', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data as Place;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['places'] }),
  });
};

export const useUpdatePlace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormData }) => {
      const { data } = await api.put(`/places/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as Place;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['places'] }),
  });
};
