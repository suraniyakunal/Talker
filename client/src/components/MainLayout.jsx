import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import ChatBox from '../components/ChatBox.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from './Navbar.jsx';

function MainLayout() {

  // const [isLogged, setIsLogged] = useState(() => !!localStorage.getItem('userInfo'))
  // const onLoginSucess = () => {
  //   setIsLogged(true)
  // }
  //
  // if (isLogged) {
  //   return (<Login onLoginSucess={onLoginSucess} />)
  // }
  return (
    <>
      {/* <Navbar /> */}
      {/* <div> */}
      {/*   <ChatBox /> */}
      {/* </div> */}
      <Outlet />
      {/* <Footer /> */}
    </>
  );
}

export default MainLayout
