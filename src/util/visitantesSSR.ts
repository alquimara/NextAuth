import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { parseCookies } from 'nookies'
import React from 'react'

export function visitantesSSR<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)
    if (cookies['nextAuth.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    }
    return await fn(ctx)
  }
}
