import { createContext, useState, useEffect } from "react"
import axios from "axios"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    axios.get('/users/login', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
  }, [])
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
