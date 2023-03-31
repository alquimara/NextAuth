import React from 'react'
import { useContextAuth } from '../context/signContext';
import { useEffect } from 'react';
import { api } from '@/service/api';

export default function dashboard() {

  const { user } = useContextAuth()
  useEffect(() => {
    api.get('/me').then(response => console.log(response))

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
