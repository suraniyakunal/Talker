import { Link } from "react-router-dom"
const Aside = () => {
  return (
    <div className="normal-text items-center justify-center flex">
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/chat'>Chats</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/post'>Posts</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/room'>Rooms</Link></button>
      <button type="submit" className="px-2 py-2 hover:bg-gray-500 transition-all rounded-sm hover:text-white"><Link to='/profile'>Profile</Link></button>
    </div>
  )
}

export default Aside
