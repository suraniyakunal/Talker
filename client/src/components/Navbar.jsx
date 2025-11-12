const Navbar = () => {
  return (
    <div>
      <header className="sticky top-0 left-0 right-0 z-10 light-black h-16 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <img src="/profile.jpg" alt="" className="rounded-full w-10 h-10" />
          <span className="font-semibold">Talker</span>
        </div>
        <div className="flex gap-3">
          {/* Icon buttons: status, new chat, menu */}
          <button>{/* SVG Icons */}</button>
        </div>
      </header>
    </div>
  )
}

export default Navbar
