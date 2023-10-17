import React, { useState } from 'react';import Navbar from './components/Navbar';
import Search from './components/Search';
import Graph from './components/Graph'
import * as d3 from 'd3';
import axios from 'axios';

function App() {
  //set walletid as global state that can then be returned by search and called in alternative functions
  const [walletId, setWalletId] = useState('');
  return (
    //calls components for the app
    <div className='body'>
      <Navbar />
      <Search setWalletId={setWalletId} />
      <Graph walletId={walletId} />
      </div>
    
    
  );
}

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:8000/getGDBAddr/');
    console.log(response.data);
    console.log('HI1')

    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData();

const fetchData3 = async () => {
  try {
    const response = await axios.get('http://localhost:8000/getNeighbors2/0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/');
    console.log(response.data);
    console.log('HI3')    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
fetchData3();




const fetchData4 = async () => {
  try {
    const response = await axios.get('http://localhost:8000/test/');
    console.log(response.data);   
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
fetchData4();

export default App;
