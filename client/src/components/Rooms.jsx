const Rooms = () => {
  return (
    <div className="min-h-full bg-cyan-500 min-w-full">
      <div className="flex items-center justify-center bg-cyan-800 px-3 space-x-3 py-2">
        <button type="submit" className="bg-gray-500 py-1 px-2">Voice</button>
        <button type="submit" className="bg-gray-500 py-1 px-2">Live</button>
      </div>

      <div>
        <h1>The list of rooms will come here</h1>
      </div>
    </div>
  )
}

export default Rooms
