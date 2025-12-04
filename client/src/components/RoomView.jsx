const RoomView = () => {
  return (
    <div className="w-full flex justify-center items-center text-white ">
      <div className="relative text-center w-2/3 border-2 h-full">
        <div className="h-40 grid w-full  p-4 gap-2 grid-cols-5">
          {/* <div className="h-10"> */}
          {/*   <h1>Speakers</h1> */}
          {/* </div> */}
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
        </div>
        <h1>The audience</h1>
        <footer className="absolute bottom-5 left-10 right-10">
          <button type="submit" className='py-3 px-3 m-2 bg-green-500 rounded-full'>mute</button>
          <button type="submit" className='py-3 px-3 m-2 bg-green-500 rounded-full'>leave</button>
          <button type="submit" className='py-3 px-3 m-2 bg-green-500 rounded-full'>Add</button>
        </footer>
      </div>
      <div className="text-center w-1/3 border-2 h-full">
        <h1>Chats</h1>
      </div>
    </div>
  )
}

export default RoomView
