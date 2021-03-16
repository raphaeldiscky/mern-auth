import React, { useState } from 'react'
import loginSvg from '../assets/login.svg'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { authenticate, isAuth } from '../helpers/auth'
import { Redirect } from 'react-router-dom'

const Login = ({ history }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password1: ''
  })

  const { email, password1 } = formData

  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value })
  }

  // submit data to backend
  const handleSubmit = (e) => {
    e.preventDefault()
    if (email && password1) {
      axios
        .post(`${process.env.REACT_APP_API_URL}/login`, {
          email,
          password: password1
        })
        .then((res) => {
          authenticate(res, () => {
            setFormData({
              ...formData,
              email: '',
              password1: ''
            })
            //   console.log(res.data);
          })
          isAuth() && isAuth().role === 'admin'
            ? history.push('/admin')
            : history.push('/private')
          toast.success(`Hey ${res.data.user.name}, welcome back`)
        })
        .catch((err) => {
          toast.error(err.response.data.error)
        })
    } else {
      toast.error('Please fill all fields')
    }
  }

  return (
    <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
      {isAuth() ? <Redirect to='/' /> : null}
      <ToastContainer />
      <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1'>
        <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
          <div className='mt-12 flex flex-col items-center'>
            <h1 className='text-2xl xl:text-3xl font-extrabold'>Sign In</h1>

            <form
              className='w-full flex-1 mt-8 text-indigo-500'
              onSubmit={handleSubmit}
            >
              <div className='mx-auto max-w-xs relative'>
                <input
                  type='email'
                  placeholder='Email'
                  onChange={handleChange('email')}
                  value={email}
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5'
                />
                <input
                  type='password'
                  placeholder='Password'
                  onChange={handleChange('password1')}
                  value={password1}
                  className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5'
                />
                <button
                  type='submit'
                  className='mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none'
                >
                  Login
                </button>
                <a
                  href='/users/password/forget'
                  className='no-underline hover:underline text-indigo-500 text-md text-right absolute right-0 mt-2'
                >
                  Forget Password?
                </a>
              </div>
              <div className='my-12 border-b text-center'>
                <div className='leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2'>
                  Or Sign Up
                </div>
              </div>
              <div className='flex flex-col items-center'>
                <a
                  href='/register'
                  className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3
           bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
                >
                  Sign Up
                </a>
              </div>
            </form>
          </div>
        </div>
        <div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
          <div
            className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${loginSvg})` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default Login
