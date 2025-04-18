import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Homepage from '../pages/Homepage'

import CarForm from '../pages/car/CarForm'
import CarList from '../pages/car/CarList'

import CustomerForm from '../pages/customer/CustomerForm'
import CustomerList from '../pages/customer/CustomerList'

import UserList from '../pages/user/UserList'
import UserForm from '../pages/user/UserForm'

import Login from '../pages/Login'

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={ <Homepage /> } />

    <Route path="/login" element={ <Login /> } />

    <Route path="/cars" element={ <CarList /> } />
    <Route path="/cars/new" element={ <CarForm /> } />
    <Route path="/cars/:id" element={ <CarForm /> } />

    <Route path="/customers" element={ 
      <CustomerList /> 
    } />
    
    <Route path="/customers/new" element={ <CustomerForm />} />
    <Route path="/customers/:id" element={ <CustomerForm />  } />

    <Route path="/users" element={ <UserList /> } />
    <Route path="/users/new" element={ <UserForm /> } />
    <Route path="/users/:id" element={ <UserForm /> } />
    
  </Routes>
}