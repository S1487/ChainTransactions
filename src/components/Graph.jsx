import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

  
const Graph = ({ walletId }) => {

    const graph = useRef(null);
    let previousWalletId = useRef(null);
    const filtered_data = useRef(null);
    const [selected_node , setSelectedNode] = useState(null);
    const [balancenode ,setBalance] = useState(null);
    const [data, setData] = useState(null); // state to hold the fetched data
    const [datanodes, setDataNodes] = useState(null);

    // Fetch data based on walletId
    const fetchData = async (walletId) => {
      try {
        const response = await fetch(`http://localhost:8000/getNeighbors2/${walletId}`);
        const result = await response.json()
        console.log(response)
        console.log("fetch data log") //testing output
        console.log(result)
        setData(result); // set the fetched data
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      }
      };

    // Effect to handle data fetching
    useEffect(() => {
      if (walletId) {
        console.log("HITESTINGEFFECT")
        fetchData(walletId);
        console.log(data)
      }
    }, [walletId]);

    const fetchDataNodeLinks = async (walletId) => {
      try {
        const response = await fetch(`http://localhost:8000/getNeighborsForLinks/${walletId}`);
        const result = await response.json()
        console.log(response)
        console.log("fetch data log") //testing output
        console.log(result)
        setDataNodes(result); // set the fetched data
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      }
      };

    // Effect to handle data fetching
    useEffect(() => {
      if (walletId) {
        console.log("HITESTINGEFFECT")
        fetchDataNodeLinks(walletId);
        console.log(data)
      }
    }, [walletId]);
    
    useEffect(() => {
      if (!datanodes) return; //Hidden if we want 
      //if (!graphRef.current) return; // Don't proceed if the ref is not attached
  
      const { wallet, from_wallets, to_wallets } = datanodes;
  
      // from API to nodes and links for graph

      const links = [];
      const linksSet = new Set();
      const nodes = []
      const nodesMap = new Set();


      nodes.push({ id: wallet.addressId })
      
      // Usage for adding nodes
      from_wallets.forEach((w) => {
        nodes.push({ id: w.addressId })
        links.push({receiver_address: wallet.addressId,sender_address: w.addressId })
      });
      
      // Usage for adding links
      to_wallets.forEach((w) => {
        nodes.push({id: w.addressId})
        links.push({ sender_address: w.addressId, receiver_address: wallet.addressId })
      });

    console.log("NODESLINKS")
    console.log(nodes) // This should now log the array of nodes
    console.log(links)


    const container = graph.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    //Dont remove current expand instead
    //d3.select(graph.current).select("svg").remove();



    const svg = d3.select(graph.current)
      .append('svg')
      .attr('width', '100%')  // Set SVG width to 100% of container
      .attr('height', '100%')  // Set SVG height to 100% of container
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g');


    
    const graphData = { nodes, links };
    console.log("Graph Data should be after this")
    console.log(graphData)
    
    let marker = svg.append("defs")
      .attr("class", "defs")
      .selectAll("marker")
      .data(links, function (d) { return d.sender_address.id + "-" + d.receiver_address.id; });

    marker = marker
      .enter()
      .append("marker")
      .style("fill", "#000")
      // Markers are IDed by link sender_address and receiver_address's name.
      // Spaces stripped because id can't have spaces.
      .attr("id", function (d) { return (d.sender_address.id + "-" + d.receiver_address.id).replace(/\s+/g, ''); })
      // Since each marker is using the same data as each path, its attributes can similarly be modified.
      // Assuming you have a "value" property in each link object, you can manipulate the opacity of a marker just like a path.
      .style("opacity", function (d) { return Math.min(d.value, 1); })
      .attr("viewBox", "0 -5 10 10")
      // refX and refY are set to 0 since we will use the radius property of the receiver_address node later on, not here.
      .attr("refX", 0) 
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .merge(marker);

    let path = svg.append("g")
      .attr("class", "paths")
      .selectAll("path")
      .data(links, function (d) { return d.sender_address.id + "-" + d.receiver_address.id; });
    // Update and exit are omitted.
    // Enter
    path = path
      .enter()
      .append("path")
      .attr("class", "enter")
      .style("fill", "none")
      .style("stroke", "#000")
      .style("stroke-opacity", function (d) { return Math.min(d.value, 1); })
      // This is how to connect each path to its respective marker
      .attr("marker-end", function(d) { return "url(#" + (d.sender_address.id + "-" + d.receiver_address.id).replace(/\s+/g, '') + ")"; })
      .merge(path);
    //draws lines between nodes 
    /*
    const link = svg
      .selectAll('path')
      .data(graphData.links)
      .enter()
      .append('path')
      //from the data takes x start y start x end y end
      .attr('d', (d) => `M ${d.sender_address.x} ${d.sender_address.y} L ${d.receiver_address.x} ${d.receiver_address.y}`)
      .style('stroke', '#69b3a2')
      .style('stroke-width', 5);
    */
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
    console.log(data)
     //on mouse click event
    .on('click', function (event, d) {
      const select_node = nodes.id.filter(
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
     console.log(graphData.nodes)             
        const simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links).id(d => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2));

        simulation.on('tick', () => {
        path.attr('d', function(d) {
          // This is a simple line for now. You might want to use a more complex path for curved links, etc.
          return `M ${d.sender_address.x},${d.sender_address.y} L ${d.receiver_address.x},${d.receiver_address.y}`;
        });
        // you will also need similar code to update the positions of the nodes
        });
          /*
    const simulation = d3.forceSimulation(graphData.nodes)
    //spreads the nodes setting distance between nodes
    //refered to when useing this  https://github.com/d3/d3-force

      .force('link', d3.forceLink().id((d) => d.id).path(graphData.links).distance(150).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('end', () => {
        //triggers on first run
        spread_nodes_center_on_search();
        // Update the previousWalletId ref
        previousWalletId.current = walletId;
      });
  
    // Call spread_nodes_center_on_search whenever walletId changes
    console.log("Testing that it was called at all")
    spread_nodes_center_on_search();

      //distributes nodes and centeres them on the searched for node
    function spread_nodes_center_on_search() {
        console.log("Testing Spread Nodes")
        path.attr('d', (d) => `M ${d.sender_address.x} ${d.sender_address.y} L ${d.receiver_address.x} ${d.receiver_address.y}`);
        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    
        const centerNode = graphData.nodes.find((node) => node.id === walletId);
        if (centerNode) {
            const dx = width / 2 - centerNode.x;
            const dy = height / 2 - centerNode.y;
    
            // Update transform attribute of 'g' element.
            svg.attr('transform', `translate(${margin.left + dx},${margin.top + dy})`);
        }
       
    } */


  }, [data, walletId]);
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
      )}*/
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