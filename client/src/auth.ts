// client/src/auth.ts
import { Role } from './types'

type LoginRes = {
  token: string
  user: {
    role: Role
    [key: string]: any
  }
  [key: string]: any
}

const KEY = 'dalat_auth'
const AUTH_EVENT = 'auth:change'

export function saveAuth(data: LoginRes) {
  localStorage.setItem(KEY, JSON.stringify(data))
  window.dispatchEvent(new Event(AUTH_EVENT)) // thông báo UI cập nhật
}

export function getAuth(): LoginRes | null {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export function logout() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
  location.href = '/login'
}

export function isAdmin() { return getAuth()?.user.role === 'ADMIN' }
export function hasRole(role: Role) {
  const u = getAuth()?.user
  return role === 'ADMIN' ? u?.role === 'ADMIN' : !!u
}
export function token() { return getAuth()?.token }

// tiện cho hook lắng nghe ở component
export const AUTH_CHANGE_EVENT = AUTH_EVENT
