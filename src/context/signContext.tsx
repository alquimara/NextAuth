import { api } from "@/service/api";
import { Children, createContext, ReactNode, useContext } from "react";
import SignIn from '../pages/index';


interface credencialsProps {
  email: string,
  password: string
}
interface AuthContextData {
  signInAuth(credencials: credencialsProps): Promise<void>,
  isAuthenticated: boolean

}
interface AuthProviderProsp {
  children: ReactNode
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProsp) {
  const isAuthenticated = false;
  async function signInAuth({ email, password }: credencialsProps) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      })
      console.log(response.data)

    } catch (error) {
      console.log(error)

    }

  }
  return (
    <AuthContext.Provider value={{ isAuthenticated, signInAuth }}>
      {children}
    </AuthContext.Provider >
  )

}
export const useContextAuth = () => useContext(AuthContext)


