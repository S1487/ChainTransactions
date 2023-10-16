import React from 'react'
import { useState } from 'react'

/* Search Component */
const Search = ({ setWalletId }) => {
    /* States */
  const [inputValue, setInputValue] = useState('');

  /* Functions */
  function handleInputChange(event) {
    setInputValue(event.target.value);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      setWalletId(inputValue);
      console.log("Wallet ID updated: ", inputValue);
    }
  }

  /* Render */
  return (
    <div className='flex flex-col justify-center items-center mb-40 w-full h-[65vh]'>
        <h1 id ='heading' className='text-white text-7xl py-12 font-semibold'>Let's take a deeper look!</h1>
        <input 
        id='search' 
        value={inputValue} 
        onChange={handleInputChange}
        onKeyDownCapture={handleKeyPress}
        className='w-2/6 h-12 pl-6 bg-[#ffffff33] border-[#ffffffee] text-[#38FFD3] focus:bg-[#001735] rounded-lg' 
        placeholder='Enter a wallet address...'></input>
    </div>
  )
}


export default Search