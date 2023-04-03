
import { api } from "@/service/apiClient";
import Router from "next/router";
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';



interface credencialsProps {
  email: string,
  password: string
}
interface AuthContextData {
  signInAuth(credencials: credencialsProps): Promise<void>,
  user: User,
  isAuthenticated: boolean

}
interface AuthProviderProsp {
  children: ReactNode
}
interface User {
  email: string,
  permissions: string[],
  roles: string[]

}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProsp) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'nextAuth.token': token } = parseCookies()
    if (token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data
        setUser({
          email,
          permissions,
          roles
        })
      }).catch(error => {
        siginOutAuth()
      })
    }
  }, [])

  async function signInAuth({ email, password }: credencialsProps) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      })
      const { roles, permissions, token, refreshToken } = response.data

      setUser({
        email,
        permissions,
        roles
      })
      setCookie(undefined, 'nextAuth.token', token,
        {
          maxAge: 60 * 60 * 24 * 30, //30dias,
          path: '/'
        })
      setCookie(undefined, 'RefreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30dias,
        path: '/'
      }),
        api.defaults.headers['Authorization'] = `Bearer ${token}`


      Router.push('/dashboard')

    } catch (error) {
      console.log(error)

    }

  }
  return (
    <AuthContext.Provider value={{ isAuthenticated, signInAuth, user }}>
      {children}
    </AuthContext.Provider >
  )

}
export function siginOutAuth() {
  destroyCookie(undefined, 'nextAuth.token')
  destroyCookie(undefined, 'nextAuth.refreshToken')
  Router.push('/')


}
export const useContextAuth = () => useContext(AuthContext)


