import { createContext, useState, useEffect } from "react"
import axiosInstance from "../configs/axios.js"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {

    const globalAuthCheck = async () => {
      try {
        const authenticatedUser = await axiosInstance.get('/users/check')
        setUser(authenticatedUser.data.user)
        if (!authenticatedUser.data.user) {
          return setUser(null)
        }

      } catch (error) {
        console.log('error getting the user for authentication', error)
      }
    }
    globalAuthCheck()
  }, [])
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
