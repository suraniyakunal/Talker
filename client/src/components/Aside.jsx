import { Link } from "react-router-dom"
const Aside = () => {
  return (
    <div className="normal-text items-center justify-center flex">
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/chats'>Chats</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/posts'>Posts</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/rooms'>Rooms</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/profile'>Profile</Link></button>
    </div>
  )
}

export default Aside
