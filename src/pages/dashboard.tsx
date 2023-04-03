import React from 'react'
import { useContextAuth } from '../context/signContext';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { autorizadoSSR } from '@/util/autorizadoSSR';
import { setupApiClient } from '@/service/api';
import { api } from '@/service/apiClient';


export default function dashboard() {

  const { user } = useContextAuth()
  useEffect(() => {
    api.get('/me').then(response => console.log(response)).catch(error => {
      console.log(error)

    })

  }, [])
  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <ul>
        {user?.permissions.map((per) => (
          <li key={per}>{per}</li>
        ))}
      </ul>
    </>
  )
}
export const getServerSideProps: GetServerSideProps = autorizadoSSR(
  async (ctx) => {
    const apiClient = setupApiClient(ctx)
    const response = await apiClient.get('/me')
    return {
      props: {}
    }

  }
)
