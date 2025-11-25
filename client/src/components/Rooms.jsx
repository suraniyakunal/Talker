import { useState } from "react"
import RoomCards from "./RoomCards"


const Rooms = () => {

  const [currentRoom, setCurrentRoom] = useState(['voiceRoom', 'liveRoom', 'create'])

  return (
    <div className="min-w-full min-h-full text-white">
      <div className="flex z-20 fixed left-50 right-50 items-center justify-center px-3 space-x-3 py-2">
        <button onClick={() => { setCurrentRoom('voiceRoom') }} type="submit" className="bg-gray-700 text-white rounded-lg py-1 px-2">Voice</button>
        <button onClick={() => { setCurrentRoom('liveRoom') }} type="submit" className="bg-gray-500 text-white rounded-lg py-1 px-2">Live</button>
        <button onClick={() => { setCurrentRoom('create') }} type="submit" className="bg-gray-500 text-white rounded-lg py-1 px-2">Create</button>
      </div>

      <div className="p-2 overflow-y-auto h-[calc(100vh-4rem)]">
        {currentRoom === 'voiceRoom' &&
          (<div id="voiceRoom" className=" mt-8 grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 space-x-5">

          </div>
          )}

        {currentRoom === 'liveRoom' &&
          (<div id="liveRoom">

            <h1>This is live room</h1>
          </div>
          )}
        {currentRoom === 'create' &&
          (<div id="create">

            <h1>This is create room</h1>
          </div>
          )}
      </div>
    </div>
  )
}

export default Rooms
