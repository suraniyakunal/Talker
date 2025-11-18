import Aside from './Aside.jsx'

const Navbar = () => {
  return (
    <header
      className="
      sticky
        medium-black normal-text
       items-center flex px-4 py-4
      justify-between shadow-lg shadow-cyan-800
      z-10
      ">
      <div className="flex items-center gap-2">
        <img src="/profile.jpg" alt="" className="rounded-full w-10 h-10" />
        <span className="font-semibold">Talker</span>
      </div>
      <div>
        <Aside />
      </div>
    </header>
  )
}

export default Navbar
