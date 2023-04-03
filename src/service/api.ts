import { siginOutAuth } from '@/context/signContext';
import { AuthTokenError } from '@/error/AuthTokenErro';
import axios, { AxiosError } from 'axios'
import { promises } from 'dns';
import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

let isRefreshing = false
let failedRequest: { onSucess: (token: string) => void; onFailure: (err: AxiosError<unknown, any>) => void; }[] = []

export function setupApiClient(cxt: undefined) {
  let cookies = parseCookies(cxt)
  const api = axios.create({
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
        cookies = parseCookies(cxt)
        const { 'nextAuth.refreshToken': refreshToken } = cookies
        const originalConfig = error.config //toda a configuracao de requisição que foi feita para o backend
        if (!isRefreshing) {
          isRefreshing = true
          api.post('/refresh', {
            refreshToken

          }).then(response => {
            const { token } = response.data
            setCookie(cxt, 'nextAuth.token', token,
              {
                maxAge: 60 * 60 * 24 * 30, //30dias,
                path: '/'
              })
            setCookie(cxt, 'RefreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, //30dias,
              path: '/'
            })
            api.defaults.headers['Authorization'] = `Bearer ${token}`
            failedRequest.forEach(request => request.onSucess(token))
            failedRequest = []


          }).catch((erro) => {
            failedRequest.forEach(request => request.onFailure(erro))
            failedRequest = []
            if (process.browser) {
              siginOutAuth()
            }
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
        if (process.browser) { //verificar se esta executando pelo o lado do browser
          siginOutAuth()

        } else {
          return Promise.reject(new AuthTokenError())
        }


      }
    }
    return Promise.reject(error)
  }
  )
  return api

}