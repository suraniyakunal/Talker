import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../configs/axios.js";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const Login = () => {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const loginHandler = async (e) => {
    e.preventDefault()

    try {

      const response = await axiosInstance.post('/users/login', { username, password })
      // Assume response.data contains user info or a success flag
      if (response.status === 200) {
        setUser(response.data.user)
        navigate('/chats')
        console.log('Login Successful');
      } else {
        console.log('Login failed');
      }

    } catch (error) {
      console.log("error in confirming the login credential", error)
    }

    setUsername('')
    setPassword('')

  }
  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className=" max-w-md  medium-black rounded-lg py-8">
        <h2 className='text-2xl normal-text font-bold mb-6 text-center'>Login :)</h2>
        <form onSubmit={loginHandler} className='space-y-6 px-4'>
          <div>
            <input required name="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder='username' className='w-full normal-text light-black px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />
          </div>
          <div>
            <input required name='password' type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='password' className='w-full normal-text light-black px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />
          </div>
          <button required type="submit" className='w-full p-2 rounded-lg text-gray-900 hover:bg-gray-600 bg-gray-300 font-semibold transition'>Login</button>
        </form>
        <h6 className='text-sm muted-text text-center pt-4'>don't have an account? <Link to='/signup'>SignUp</Link></h6>
      </div>

    </div>
  )
}

export default Login
