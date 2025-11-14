import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <div>
      <footer className="absolute bottom-0 left-80 bg-transparent rounded-md right-80 normal-text z-10  h-16 px-4 gap-20 flex items-center justify-center shadow-md">
        <button type="submit"><Link to='/chat'>chats</Link></button>
        <button type="submit"><Link to='/posts'>posts</Link></button>
        <button type="submit"><Link to='/rooms'>rooms</Link></button>
        <button type="submit"><Link to='/profile'>profile</Link></button>
      </footer>

    </div>
  )
}

export default Footer
