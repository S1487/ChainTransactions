import React from 'react'
import logo from './images/Chainsactions.png';

/* Navbar Component */
const Navbar = () => {
  
  /* Render */
  return (
    <div className='flex flex-row place-items-center justify-between w-full'>
      <div id='space' className='ml-12 w-20'></div>
      <img id='logo' className='w-64 py-6' src={logo} alt='Chainsactions'></img>
      <button id='signUp' className='hover:bg-[#38FFD3] hover:text-[#000915] rounded-md h-10 w-20 bg-[#000915] text-[#38FFD3] border-[#38FFD3] border transition duration-100 mr-12'>Sign Up</button>
    </div>
  )
}

export default Navbar