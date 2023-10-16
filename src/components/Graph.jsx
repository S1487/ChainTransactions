import React, { useState,useRef, useEffect } from 'react';
import * as d3 from 'd3';
import axios from 'axios';


const fetchData3 = async () => {
  try {
    const response = await axios.get('http://localhost:8000/getNeighbors/0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/');
    console.log(response.data);
    console.log('HI3')    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
fetchData3()
useEffect(() => {
  // If walletId is null or undefined, don't fetch data
  if (!walletId) {
    return;
  }

  fetchData(walletId); // Fetch new data with updated walletId
}, [walletId]);


const Graph = ({ walletId }) => {
    const graph = useRef(null);
    let previousWalletId = useRef(null);
    const filtered_data = useRef(null);
    const [selected_node , setSelectedNode] = useState(null);
    const [balancenode ,setBalance] = useState(null);
    const [nodes, setnodes] = useState(null);
    const [relationships, setrelationships] = useState(null)
    const [data,setData]=useState(null);
  // Hardcoded array of transactions
  /*const data = [
    { sender_address: '0x123', receiver_address: '0x456',amount: "6 Eth",balance: '60 Eth' },
    { sender_address: '0x789', receiver_address: '0xabc',amount: "4.2 Eth",balance: '80 Eth' },
    { sender_address: '0x789', receiver_address: '0xa9c',amount: "4 Eth",balance: '80 Eth' },
    { sender_address: '0x859', receiver_address: '0xa50c',amount: "0.2 Eth",balance: '70 Eth' },
    { sender_address: '0x859', receiver_address: '0xa503c', amount: "0.7Eth",balance: '70 Eth' },
    { sender_address: '0x8290', receiver_address: '0xa503c', amount: "0.4 Eth",balance: '80 Eth' },
    { sender_address: '0x123', receiver_address: '0x456', amount: "0.2 Eth",balance: '60 Eth' },
    { sender_address: '0x759', receiver_address: '0xabc', amount: "0.1 Eth",balance: '80 Eth' },
    { sender_address: '0x719', receiver_address: '0xa9c', amount: "0.15 Eth",balance: '80 Eth' },
    { sender_address: '0x8259', receiver_address: '0xb50c', amount: "1.9 Eth",balance: '80 Eth' },
    { sender_address: '0x8681', receiver_address: '0xa5063c', amount: "13 Eth",balance: '80 Eth' },
    { sender_address: '0x8750c', receiver_address: '0xa5303c', amount: "5.3 Eth",balance: '80 Eth' },
    { sender_address: '0x123b', receiver_address: '0x456c', amount: "1.4 Eth",balance: '80 Eth' },
    { sender_address: '0x789a', receiver_address: '0xabca',amount: "0.3 Eth",balance: '80 Eth' },
    { sender_address: '0x78x9', receiver_address: '0xa9ct',amount: "0.8 Eth",balance: '80 Eth' },
    { sender_address: '0x859x', receiver_address: '0xa50cz', amount:"0.9 Eth",balance: '71 Eth' },
    { sender_address: '0x859x', receiver_address: '0xa503c', amount: "0.5 Eth",balance: '71 Eth' },
    { sender_address: '0x8290', receiver_address: '0xa503c', amount: "0.7 Eth",balance: '80 Eth' },
    { sender_address: '0x8750c', receiver_address: '0xa503c', amount: "5.3 Eth",balance: '65 Eth' },
    { sender_address: '0x8750c', receiver_address: '0xabca', amount: "5.3 Eth",balance: '65 Eth' },
    { sender_address: '0xabcc', receiver_address: '0xabca', amount: "5.3 Eth",balance: '80 Eth' },
    { sender_address: '0xabc', receiver_address: '0xabcc', amount: "5.3 Eth",balance: '80 Eth' },
    { sender_address: '0x123', receiver_address: '0x456', amount: "6 Eth", balance: '60 Eth' },
    { sender_address: '0x789', receiver_address: '0xabc', amount: "4.2 Eth", balance: '80 Eth' },
    { sender_address: '0x789', receiver_address: '0xa9c', amount: "4 Eth", balance: '80 Eth' },
    { sender_address: '0x859', receiver_address: '0xa50c', amount: "0.2 Eth", balance: '70 Eth' },
    { sender_address: '0x859', receiver_address: '0xa503c', amount: "0.7 Eth", balance: '70 Eth' },
    { sender_address: '0xabc', receiver_address: '0xabcc', amount: "5.3 Eth", balance: '80 Eth' },
    { sender_address: '0x456', receiver_address: '0xabc', amount: "4 Eth", balance: '50 Eth' },
    { sender_address: '0xa9c', receiver_address: '0x859', amount: "9 Eth", balance: '50 Eth' },
    { sender_address: '0xa50c', receiver_address: '0x859', amount: "12 Eth", balance: '50 Eth' },
    { sender_address: '0xa503c', receiver_address: '0x123', amount: "4 Eth", balance: '50 Eth' },
    { sender_address: '0xabcc', receiver_address: '0x123', amount: "13 Eth", balance: '50 Eth' }
    
  ];*/

  
  
  useEffect(() => {
    //to avoid error when hiding until search has been performed
    if (!graph.current) {
      return;
    }

    //dont show unteil a node has been searched for
    console.log("This is wallet id update"+walletId)
    //Fill container with graph
    const container = graph.current.parentElement;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    d3.select(graph.current).select("svg").remove();
    const svg = d3.select(graph.current)
      .append('svg')
      .attr('width', '100%')  // Set SVG width to 100% of container
      .attr('height', '100%')  // Set SVG height to 100% of container
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g');

    const nodes = [];
    const links = [];
    const fetchData = async () => {
      try {
        // Assuming you've set up your server to serve data at this endpoint
        const response = await axios.get('http://localhost:8000/getNeighbors/0xd90e2f925da726b50c4ed8d0fb90ad053324f31b/');
        setData(response.data); // Set the data state
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    //populates table on change of walletId
    const fetchSelectedNodes = () => {
      const select_node = data.filter(
        (transaction) => transaction.sender_address === walletId || transaction.receiver_address === walletId
      );
      const balance = data.find(
        (transaction) => transaction.sender_address === walletId
      );
      setBalance(balance);
      setSelectedNode(select_node);
    };

    if (walletId) {
      fetchSelectedNodes();
    }

    //extract data and put it into nodes if the node already exists we are addding the transaction information to it
    data.forEach((transaction) => {
        const senderNode = nodes.find(node => node.id === transaction.sender_address);
        const receiverNode = nodes.find(node => node.id === transaction.receiver_address);
      
        if (!senderNode) {
          nodes.push({ id: transaction.sender_address });
        }
        if (!receiverNode) {
          nodes.push({ id: transaction.receiver_address });
        }
      
        links.push({ source: transaction.sender_address, target: transaction.receiver_address });
      
      });

    const graphData = { nodes, links };
    //draws lines between nodes 
    const link = svg
      .selectAll('path')
      .data(graphData.links)
      .enter()
      .append('path')
      //from the data takes x start y start x end y end
      .attr('d', (d) => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`)
      .style('stroke', '#69b3a2')
      .style('stroke-width', 5);
    
      //defines tooltips then modified by mouseover
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


    //draws the nodes
  const node = svg
    .selectAll('circle')
    .data(graphData.nodes)
    .enter()
    .append('circle')
    .attr('r', 20)
    .style('fill', '#69b3a2')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    
    //mouse over trigger for tooltips
    .on('mouseover', function(event, d) {
      tooltip.transition()
          .duration(200)
          .style("opacity", .9);
  
      tooltip.html("Wallet ID: " + d.id)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .style("z-index", 9999); // Ensure it's on top
    })
    .on('mousemove', function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function(event, d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    //on mouse click event
    .on('click', function (event, d) {
      const select_node = data.filter(
        (transaction) => transaction.sender_address === d.id || transaction.receiver_address === d.id
      );
      const balance = data.find(
        (transaction) => transaction.sender_address === d.id);
      setBalance(balance)
      setSelectedNode(select_node);
    
      // Reset the style for all nodes
      node.style('fill', '#69b3a2')
          .attr('r', 20)
          .style('stroke', 'none');
    
      const centerNode = graphData.nodes.find((node) => node.id === d.id);
      if (centerNode) {
        const dx = width / 2 - centerNode.x;
        const dy = height / 2 - centerNode.y;
    
        // Transition the transform attribute for a smooth animation
        svg.transition()
          .duration(1000) // Set the duration of the transition in milliseconds
          .attr('transform', `translate(${margin.left + dx},${margin.top + dy})`);
    
        // Update the positions of nodes with a transition
        node.transition()
          .duration(1000) // Set the duration of the transition in milliseconds
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y);
    
        // Adjust style for the selected node
        d3.select(this)
          .transition()
          .duration(500) // Set the duration of the transition (in milliseconds)
          .style('fill', '#98cbbf') // Change fill color
          .attr('r', 30) // Increase radius
          .style('stroke', '#ffffff') // Add white border
          .style('stroke-width', '4px'); // Set border width
      }
    });
    

  
    const simulation = d3.forceSimulation(graphData.nodes)
    //spreads the nodes setting distance between nodes
    //refered to when useing this  https://github.com/d3/d3-force

      .force('link', d3.forceLink().id((d) => d.id).links(graphData.links).distance(150).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('end', () => {
        //triggers on first run
        spread_nodes_center_on_search();

        // Call the function again if walletId has changed
        if (walletId !== previousWalletId.current) {
          spread_nodes_center_on_search();
        }

        // Update the previousWalletId ref
        previousWalletId.current = walletId;
      });
  
    // Call spread_nodes_center_on_search whenever walletId changes
    console.log("Testing that it was called at all")
    spread_nodes_center_on_search();

      //distributes nodes and centeres them on the searched for node
    function spread_nodes_center_on_search() {
        console.log("Testing Spread Nodes")
        link.attr('d', (d) => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`);
        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    
        const centerNode = graphData.nodes.find((node) => node.id === walletId);
        if (centerNode) {
            const dx = width / 2 - centerNode.x;
            const dy = height / 2 - centerNode.y;
    
            // Update transform attribute of 'g' element.
            svg.attr('transform', `translate(${margin.left + dx},${margin.top + dy})`);
        }
    }


  }, [walletId]);
//returns the graph and datatable elements 
if (!walletId) {
  return (<div><p>""</p></div>); // Or return some placeholder JSX
}
else {
  return (

    //output the graph
    <div className="flex flex-col justify-start items-center w-full h-fit">
      <div
        id="graphcontainer"
        className="w-4/6 pl-1 bg-[#ffffff33] border-[#ffffffee] rounded-lg grid place-items-center mt-2 h-[70vh]"
        ref={graph}
      />
      {balancenode &&(
        <div className="grid grid-cols-2 gap-6 h-[10vh] w-4/6 mt-6 bg-[#ffffffFF] border-[#ffffffee] rounded-lg place-items-center p-6">
          <div className="font-bold">Searched Wallet</div>
          <div className="font-bold">Balance</div>
          <div className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
            {balancenode.sender_address}
          </div>
          <div className="border-black overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
                {balancenode.balance}
          </div>
        </div>
      )}
        {selected_node && (
          <div className="grid grid-cols-3 gap-4 w-4/6 mt-6 bg-[#ffffffFF] border-[#ffffffee] rounded-lg place-items-center p-6 mb-10">
            <div className="font-bold">Sender Address</div>
            <div className="font-bold">Receiver Address</div>
            <div className="font-bold">Transaction</div>
              {selected_node.map((transaction, index) => (
              <>
              <div key={index + "-sender"} className="border-black overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
                {transaction.sender_address}
              </div>
              <div key={index + "-receiver"} className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
                {transaction.receiver_address}
              </div>
              <div key={index + "-action"} className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
                {transaction.amount}
              </div>
              </>
              ))}
          </div>
        )}
    </div>
  );
}}


export default Graph;
/*<div className="grid grid-cols-3 gap-4 h-[90vh] w-4/6 mt-10 bg-[#ffffffFF] border-[#ffffffee] rounded-lg place-items-center">
<div className="font-bold border-b border-black">Sender Address</div>
<div className="font-bold border-b border-black">Receiver Address</div>
<div className="font-bold border-b border-black">Transaction</div>
{selected_node.map((transaction, index) => (
  <>
    <div key={index + "-sender"} className="border-black overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
      {transaction.sender_address}
    </div>
    <div key={index + "-receiver"} className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
      {transaction.receiver_address}
    </div>
    <div key={index + "-action"} className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
      {transaction.amount}
    </div>
  </>
))}
</div>*/