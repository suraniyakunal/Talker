const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className=" max-w-md lg:max-w-lg container rounded-lg py-8">
        <h2 className='text-2xl font-bold mb-6 text-center'>Login :)</h2>
        <form className='space-y-6 px-4'>
          <div>
            <input name="email" value="" placeholder='example@gmail.com' className='w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />
          </div>
          <div>
            <input name='password' value="" placeholder='password' className='w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />
          </div>
          <button type="submit" className='w-full p-2 rounded-lg text-gray-900 hover:bg-gray-600 bg-gray-300 font-semibold transition'>Login</button>
        </form>
        <h6 className='text-sm text-center pt-4'>don't have an account? <a href="" className='text-indigo-500'>SignUp</a></h6>
      </div>

    </div>
  )
}

export default Login
