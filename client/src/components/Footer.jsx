import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <div>
      <footer className="absolute bottom-0 left-0 right-0 light-black z-10  h-16 px-4 gap-20 flex items-center justify-center shadow-md">
        <button type="submit"><Link to='/'>chats</Link></button>
        <button type="submit"><Link to='/posts'>posts</Link></button>
        <button type="submit"><Link to='/rooms'>rooms</Link></button>
        <button type="submit"><Link to='/profile'>profile</Link></button>
      </footer>

    </div>
  )
}

export default Footer
