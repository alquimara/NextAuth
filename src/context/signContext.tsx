import { api } from "@/service/api";
import Router from "next/router";
import { setCookie } from 'nookies'
import path from "path";
import { Children, createContext, ReactNode, useContext, useState } from 'react';
import SignIn from '../pages/index';


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
export const useContextAuth = () => useContext(AuthContext)


