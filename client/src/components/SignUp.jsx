import axios from "axios"
import { useState } from "react"
import { Link } from "react-router-dom"

const SignUp = () => {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/users/signup', { username, email, password })
      console.log(data)
    } catch (error) {
      console.log("error sending the data from signup", error)
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="container md:max-w-md rounded-lg py-8 ">
        <h2 className=" text-2xl text-center font-bold mb-6">SignUp :)</h2>
        <form onSubmit={handleSignUp} className="space-y-6 px-6">
          <div>
            <input
              required
              onChange={(e) => { setUsername(e.target.value) }}
              value={username}
              type="text"
              name="username"
              placeholder="Username"
              className="w-full normal-text 
              light-black px-3 py-2 
              rounded-md focus:outline-none
              focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <input
              required
              onChange={(e) => { setEmail(e.target.value) }}
              value={email}
              type="email"
              name="email"
              placeholder="example@gmail.com"
              className="w-full normal-text 
              light-black px-3 py-2 
              rounded-md focus:outline-none
              focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <input
              required
              onChange={(e) => { setPassword(e.target.value) }}
              value={password}
              type="password"
              name="password"
              placeholder="Password"
              className="w-full normal-text 
              light-black px-3 py-2 
              rounded-md focus:outline-none
              focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full p-2 rounded-lg bg-gray-300 hover:bg-gray-700 transition">SignUp</button>
        </form>
        <h6 className='text-sm muted-text text-center pt-4'>have an account? <Link to='/login'>login</Link></h6>
      </div>
    </div>
  )
}

export default SignUp
