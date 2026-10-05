import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const stripPassword = ({ password, ...safe }) => safe

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const login = async (email, password) => {
    const { data } = await api.get('/users', { params: { email: email.trim().toLowerCase() } })
    const found = data.find((u) => u.password === password)
    if (!found) throw new Error('Invalid email or password')
    const safe = stripPassword(found)
    setUser(safe)
    return safe
  }

  const register = async ({ name, email, password }) => {
    const mail = email.trim().toLowerCase()
    const { data: existing } = await api.get('/users', { params: { email: mail } })
    if (existing.length) throw new Error('This email is already registered')
    const { data } = await api.post('/users', {
      name: name.trim(),
      email: mail,
      password,
      role: 'user',
      phone: '',
      address: '',
    })
    const safe = stripPassword(data)
    setUser(safe)
    return safe
  }

  const updateUser = async (changes) => {
    const { data } = await api.patch(`/users/${user.id}`, changes)
    const safe = stripPassword(data)
    setUser(safe)
    return safe
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
