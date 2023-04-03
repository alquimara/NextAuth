import { AuthTokenError } from '@/error/AuthTokenErro'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { destroyCookie, parseCookies } from 'nookies'
import React from 'react'

export function autorizadoSSR<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)
    if (!cookies['nextAuth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }
    try {
      return await fn(ctx)

    } catch (error) {
      if (error instanceof AuthTokenError) {
        console.log('passei aqui')
        destroyCookie(ctx, 'nextAuth.token')
        destroyCookie(ctx, 'nextAuth.refreshToken')
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}
