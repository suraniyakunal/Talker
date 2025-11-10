
function App() {
  return (
    <>
      {/* mobile design*/}
      <div className='min-w-screen block lg:hidden flex flex-col'>
        <header className="sticky text-xl top-0 left-0 right-0 z-10 bg-green-800 h-20 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            {/* <img src="/profile.jpg" alt="profile" className="rounded-full w-10 h-10" /> */}
            <span className="font-semibold">Talker</span>
          </div>
          <div className="flex gap-3">
            {/* Icon buttons: status, new chat, menu */}
            <button>{/* SVG Icons */}Rooms</button>
          </div>
        </header>

        {/* Chat List  */}
        <main className="pt-16 pb-20 flex-1 overflow-y-auto">
          {/* {chats.map(chat => ( */}
          <div className="flex text-white items-center p-4 border-b">
            {/* <img src={chat.avatar} alt="" className="w-10 h-10 rounded-full mr-3" /> */}
            <div>
              <li>pagal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>lallu</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              <li>kunal</li>
              {/* <div className="font-semibold">{chat.name}</div> */}
              {/* <div className="text-xs text-neutral-400">{chat.lastMessage}</div> */}
            </div>
            {/* <span className="ml-auto text-xs text-neutral-500">{chat.time}</span> */}
          </div>
          {/* ))} */}
        </main>



        {/* Input Bar */}
        <footer className="fixed bottom-0 left-0 right-0 bg-green-800 px-4 py-3 h-16 text-xl flex justify-evenly">
          <button type="submit">chats</button>
          <button type="submit">posts</button>
          <button type="submit">rooms</button>
          <button type="submit">profile</button>
        </footer>

      </div>


      {/* Desktop design  */}
      <div className="min-h-screen hidden lg:block flex flex-col text-white relative">
        {/* Header, Sidebar, Main Content will go here */}

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

        <main className="flex h-[calc(100vh-4rem)] mt-20">
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto h-full p-4">
            <div className="flex flex-col items-center justify-center w-full">
              {/* Multiple contacts */}
              {[...Array(30).keys()].map(i => (
                <h1 key={i} className="mb-4 light-black border">Contact {i + 1}</h1>
              ))}
            </div>
          </div>
          <div className="flex h-[69vh] flex-col justify-items-end items-center flex-1 gap-3 overflow-y-auto relative w-full">

            {/* Outgoing Message */}
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">
              "Hey there! 👋"
            </div>

            {/* Incoming Message */}
            <div className="self-start bg-neutral-800 text-white rounded-2xl px-4 py-2 max-w-xs">
              "Hi! How are you?"
            </div>
            {/* Outgoing Message */}
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"Hey there! 👋"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"This is differnet"</div>
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">"This is differnet"</div>

          </div>
          {/* Input area fixed at bottom */}
          <div className="absolute bottom-20 right-4 flex gap-2 w-[63vw] justify-center items-center px-4 py-4">
            <input
              type="text"
              name="Message"
              placeholder="Type your messages"
              className="w-full rounded-lg shadow-md h-10 focus:ring-2 focus:outline-none focus:ring-indigo-500 px-3 py-2"
            />
            <button type="submit" className=" font-semibold shadow-md rounded h-10 w-20 bg-indigo-600">
              Send
            </button>
          </div>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 light-black z-10  h-16 px-4 gap-20 flex items-center justify-center shadow-md">
          <button type="submit">chats</button>
          <button type="submit">posts</button>
          <button type="submit">rooms</button>
          <button type="submit">profile</button>
        </footer>
      </div>
    </>
  );
}

export default App
