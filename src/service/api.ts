import { siginOutAuth } from '@/context/signContext';
import axios, { AxiosError } from 'axios'
import { promises } from 'dns';
import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
let cookies = parseCookies()
let isRefreshing = false
let failedRequest: { onSucess: (token: string) => void; onFailure: (err: AxiosError<unknown, any>) => void; }[] = []

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextAuth.token']}`
  }


})
api.interceptors.response.use(response => {
  return response
}, (error: AxiosError) => {
  if (error.response?.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      cookies = parseCookies()
      const { 'nextAuth.refreshToken': refreshToken } = cookies
      const originalConfig = error.config //toda a configuracao de requisição que foi feita para o backend
      if (!isRefreshing) {
        isRefreshing = true
        api.post('/refresh', {
          refreshToken

        }).then(response => {
          const { token } = response.data
          setCookie(undefined, 'nextAuth.token', token,
            {
              maxAge: 60 * 60 * 24 * 30, //30dias,
              path: '/'
            })
          setCookie(undefined, 'RefreshToken', response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30, //30dias,
            path: '/'
          })
          api.defaults.headers['Authorization'] = `Bearer ${token}`
          failedRequest.forEach(request => request.onSucess(token))
          failedRequest = []


        }).catch((erro) => {
          failedRequest.forEach(request => request.onFailure(erro))
          failedRequest = []
        }).finally(() => {
          isRefreshing = false
        })
      }
      return new Promise((resolve, reject) => {
        failedRequest.push({
          onSucess: (token: string) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`
            resolve(api(originalConfig))
          },
          onFailure: (err: AxiosError) => {
            reject(err)
          }
        })

      })

    } else {
      siginOutAuth()

    }
  }
  return Promise.reject(error)
}
)
