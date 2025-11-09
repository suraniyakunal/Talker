
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
      <div className="min-h-screen hidden lg:block flex flex-col bg-neutral-900 text-white">
        {/* Header, Sidebar, Main Content will go here */}

        <header className="sticky top-0 left-0 right-0 z-10 bg-neutral-800 h-16 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <img src="/profile.jpg" alt="" className="rounded-full w-10 h-10" />
            <span className="font-semibold">Talker</span>
          </div>
          <div className="flex gap-3">
            {/* Icon buttons: status, new chat, menu */}
            <button>{/* SVG Icons */}</button>
          </div>
        </header>

        {/* <main className="pt-16 pb-20 flex overflow-y-auto bg-green-800"> */}
        {/* {chats.map(chat => ( */}
        {/* <div className="flex flex-none p-4 border-r-2"> */}
        {/* <img src={chat.avatar} alt="" className="w-10 h-10 rounded-full mr-3" /> */}
        {/* <div> */}
        {/* <div className="font-semibold">{chat.name}</div> */}
        {/* <li>dumbo</li> */}
        {/* <li>dumbo</li> */}
        {/* <li>dumbo</li> */}
        {/* <li>dumbo</li> */}
        {/* <li>dumbo</li> */}
        {/* <li>dumbo</li> */}
        {/* <li>dumbo</li> */}
        {/* <li>dumbo</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* <div className="text-xs text-neutral-400">{chat.lastMessage}</div> */}
        {/* </div> */}
        {/* <span className="ml-auto text-xs text-neutral-500">{chat.time}</span> */}
        {/* <li>dumbo</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* <li>kunal</li> */}
        {/* </div> */}
        {/* ))} */}
        {/* <div className="flex flex-col flex-auto gap-3 px-3 py-2"> */}
        {/* Outgoing Message */}
        {/* <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs"> */}
        {/* "Hey there! 👋" */}
        {/* </div> */}
        {/* Incoming Message */}
        {/* <div className="self-start bg-neutral-800 text-white rounded-2xl px-4 py-2 max-w-xs"> */}
        {/* "Hi! How are you?" */}
        {/* </div> */}
        {/* </div> */}

        {/* </main> */}


        <main className="flex mt-20">
          <div className="overflow-y-auto border-r w-1/3">
            <h2 className="font-semibold text-center">Contacts</h2>
            <div>
              <h1>helll</h1>
              <h1>bsjbxjb</h1>
              <h1>helll</h1>
              <h1>helll</h1>
              <h1>helll</h1>
              <h1>helll</h1>
              <h1>helll</h1>
              <h1>helll</h1>
            </div>
          </div>

          <div className="flex h-[79vh] flex-col flex-1 gap-3 overflow-y-auto p-4 relative">
            <h2 className="font-semibold text-center">Chats</h2>

            {/* Outgoing Message */}
            <div className="self-end bg-indigo-600 text-white rounded-2xl px-4 py-2 max-w-xs">
              "Hey there! 👋"
            </div>

            {/* Incoming Message */}
            <div className="self-start bg-neutral-800 text-white rounded-2xl px-4 py-2 max-w-xs">
              "Hi! How are you?"
            </div>

            {/* Input area fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-green-800 flex gap-3">
              <input
                type="text"
                name="Message"
                placeholder="Type your messages"
                className="flex-1 rounded-lg h-10"
              />
              <button type="submit" className="px-6 py-2 font-semibold rounded">
                Send
              </button>
            </div>

            {/* Add padding bottom to chat content so last messages are not hidden under input */}
            <div className="pb-20"></div>
          </div>

        </main>


        <footer className="fixed bottom-0 left-0 right-0 z-10 bg-neutral-800 h-16 px-4 gap-20 flex items-center justify-center shadow-md">
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
