import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Shopify } from './Shopify'

export const MainRoute = () => {
  return (
    <Routes>
        <Route path='/' element={<Shopify/>} />
    </Routes>
  )
}
