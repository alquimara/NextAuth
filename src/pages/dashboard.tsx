import React from 'react'
import { useContextAuth } from '../context/signContext';

export default function dashboard() {

  const { user } = useContextAuth()
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
