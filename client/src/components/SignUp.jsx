const SignUp = () => {
  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="container md:max-w-md rounded-lg py-8 ">
        <h2 className=" text-2xl text-center font-bold mb-6">SignUp :)</h2>
        <form className="space-y-6 px-6">
          <div>
            <input type="text" name="username" placeholder="Username" className="w-full py-2 px-3 rounded-lg focus:ring-2 focus:outline-none focus:ring-indigo-500" />
          </div>
          <div>
            <input type="text" name="email" placeholder="example@gmail.com" className="w-full py-2 px-3 rounded-lg focus:ring-2 focus:outline-none focus:ring-indigo-500" />
          </div>
          <div>
            <input type="password" name="password" placeholder="Password" className="w-full py-2 px-3 rounded-lg focus:ring-2 focus:outline-none focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full p-2 rounded-lg bg-gray-300 hover:bg-gray-700 transition">SignUp</button>
        </form>
        <h6 className='text-sm text-center pt-4'>already have an account? <a href="" className='text-indigo-500'>Login</a></h6>
      </div>
    </div>
  )
}

export default SignUp
