import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../configs/axios"
import AuthContext from '../auth/AuthContext.jsx'

const Aside = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleLogOut = async () => {
    const request = 'yes'
    const response = await axiosInstance.post('/users/logout', { request })

    if (response.status === 200) {
      navigate('/')
      alert(`${user.username} is logged out`)
    }
  }
  return (
    <div className="normal-text items-center justify-center flex">
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/chats'>Chats</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/posts'>Posts</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/rooms'>Rooms</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/profile'>Profile</Link></button>
      <button onClick={handleLogOut} type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white">Logout</button>
    </div>
  )
}

export default Aside
