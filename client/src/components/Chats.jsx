const Chats = () => {
  return (
    <main className="flex h-full w-full">
      <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
        <div className="flex flex-col medium-black justify-center">
          {/* Multiple contacts */}
          {[...Array(30).keys()].map(i => (
            <h1 key={i} className="normal-text p-6 border-b-2">Contact {i + 1}</h1>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-items-end items-center flex-1 gap-3 overflow-y-auto relative w-full">

        {/* Outgoing Message */}
        <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">
          I don't know
        </div>

        {/* Incoming Message */}
        <div className="self-start bg-neutral-800 text-white rounded-2xl px-4 py-2 max-w-xs">
          "Hi! How are you?"
        </div>
        <div></div>
      </div>

      {/* Input area fixed at bottom */}
      <div className="absolute bottom-10 left-[500px] right- flex gap-2 w-[63vw] justify-center items-center px-4 py-4">
        <input
          type="text"
          name="Message"
          placeholder="Type your messages"
          className="w-full muted-text rounded-lg shadow-sm shadow-amber-50 h-10 focus:outline-none px-3 py-2"
        />
        <button type="submit" className=" font-semibold normal-text shadow-md rounded h-10 w-20 bg-indigo-600">
          Send
        </button>
      </div>
    </main>
  )
}

export default Chats
