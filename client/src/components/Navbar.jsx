const Navbar = () => {
  return (
    <header
      className="
        medium-black normal-text
       items-center flex px-4 py-4
      justify-between
      ">
      <div className="flex items-center gap-2">
        <img src="/profile.jpg" alt="" className="rounded-full w-10 h-10" />
        <span className="font-semibold">Talker</span>
      </div>
      <div>
        {/* Icon buttons: status, new chat, menu */}
        <button>{/* SVG Icons */}Menu</button>
      </div>
    </header>
  )
}

export default Navbar
