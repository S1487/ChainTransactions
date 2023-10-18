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
    const [nodes, setNodes] = useState(null);
    const [links, setLinks] = useState(null);

    
    const [graphData, setGraphData] = useState(null);

    // Fetch data based on walletId
    const fetchData = async (walletId) => {
      try {
        const response = await fetch(`http://localhost:8000/getNeighbors2/${walletId}`);
        const result = await response.json()
        console.log("fetch data neighbors log") //testing output
        console.log(result)
        setData(result); // set the fetched data
        console.log('fetch data setdata neighbors')
        console.log(data)
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      }
      };
    useEffect(() => {
        console.log('Data state updated:', data);
      }, [data]);




    const fetchDataNodeLinks = async (walletId) => {
      try {
        const response = await fetch(`http://localhost:8000/getNeighborsForLinks/${walletId}`);
        const result = await response.json()
        setDataNodes(result); // set the fetched data
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      }
      };

    // Effect to handle data fetching
    useEffect(() => {
      if (walletId) {
        fetchDataNodeLinks(walletId);
        fetchData(walletId);
      }
    }, [walletId]);


    useEffect(() => {
      if (data) {
        let nodesInGraph = []
        let linksInGraph = []
        if (!nodes)
          {
          }
        else {
           nodesInGraph = nodes
        }
        if (!links)
          {
          }
        else {
             linksInGraph = links
          }
        //take items from the transactions return and put unique items into the wallet
        data.transactions.forEach((item) => {
          const { from_wallet, to_wallet, transaction } = item;
  
          

        
          const addIfNew = (wallet) => {
            const walletExists = nodesInGraph.some(node => node.id === wallet.addressId);
            if (!walletExists) {
              nodesInGraph.push({ id: wallet.addressId, ...wallet }); 
            }
          };
  
          addIfNew(from_wallet);
          addIfNew(to_wallet);

          const addLinkIfNew = (transaction,from_wallet,to_wallet) => {
            const linkPresent = linksInGraph.some(link => link.transaction_id === transaction.transaction_id);
            if (!linkPresent) {
              linksInGraph.push({
                source: from_wallet.addressId,
                target: to_wallet.addressId,
                transaction_id: transaction.transaction_id
              }); }
          };
          addLinkIfNew(transaction,from_wallet,to_wallet)
        });
      setNodes(nodesInGraph)
      setLinks(linksInGraph)
      console.log("Links+nodes new")
      console.log(nodesInGraph)
      console.log(linksInGraph)
      const container = graph.current.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };

      d3.select(graph.current).selectAll("*").remove();
      
      const svg = d3.select(graph.current)
      .append('svg')
      .attr('width', '100%')  // Set SVG width to 100% of container
      .attr('height', '100%')  // Set SVG height to 100% of container
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g');
      
      svg.append('svg:defs').append('svg:marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('markerWidth', 15)
        .attr('markerHeight', 15)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5') 
        .attr('fill', '#37dfc5');
      

      const simulation = d3.forceSimulation(nodesInGraph)
        .force("link", d3.forceLink(linksInGraph).id(d => d.id).distance(60))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(linksInGraph)
        .enter().append("path")
        .attr('id', (d, i) => 'link' + i)
        .attr('stroke', '#37dfc5')
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrow)');


        //tooltip definition
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
        //define the node
      const node = svg.append("g")
        .selectAll("circle")
        .data(nodesInGraph)
        .enter().append("g")
        
        //Node functionality click/Expand
        .on('mouseover', function(event, d) {
          console.log(d.id)
          tooltip.transition()
              .duration(200)
              .style("opacity", .9);
      
          tooltip.html("Wallet ID: " + d.id)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px")
              .style("z-index", 9999); // Ensure it's on top
        })

        .on("mouseout", function(event, d) {
          tooltip.transition()
              .duration(0)
              .style("opacity", 0);
      })
      .on('click', function (event, d) {
        console.log(d.id)
        fetchData(d.id)
        tooltip.transition()
              .duration(0)
              .style("opacity", 0);}
        
        );
        ;
      node.append("circle")
        .attr("r",12)
        .attr("fill", "#37dfc5");

      node.append("text")
        .text(d => d.id.substring(0, 5))
        .attr('x', -8.5)
        .attr('y', 3)
        .attr("class", "node-text");
      

        //https://observablehq.com/@342dc9e375d75ed7/force-directed-graph-with-self-link
        simulation.on("tick", () => {
          link.attr("d", function(d) {
            var x1 = d.source.x,
                y1 = d.source.y,
                x2 = d.target.x,
                y2 = d.target.y,
                dx = x2 - x1,
                dy = y2 - y1,
                dr = Math.sqrt(dx * dx + dy * dy),
      
                // Defaults for normal edge.
                drx = dr,
                dry = dr,
                xRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0
      
                // Self edge.
                //for looping one used the above reference
                if ( x1 === x2 && y1 === y2 ) {
                  // Fiddle with this angle to get loop oriented.
      
                  // Needs to be 1.
                  largeArc = 1;
      
                  // Change sweep to change orientation of loop. 
                  //sweep = 0;
      
                  // Make drx and dry different to get an ellipse
                  // instead of a circle.
                  drx = 30;
                  dry = 30;
                  
                  // For whatever reason the arc collapses to a point if the beginning
                  // and ending points of the arc are the same, so kludge it.
                  x2 = x2 + 1;
                  y2 = y2 + 1;
                } 
      
           return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
          });
          node
            .attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            })
        });

        
    }
  }, [data]);




/*
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
        links.push({target: wallet.addressId,source: w.addressId })
      });
      
      // Usage for adding links
      to_wallets.forEach((w) => {
        nodes.push({id: w.addressId})
        links.push({ source: w.addressId, target: wallet.addressId })
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
      .data(links, function (d) { return d.source.id + "-" + d.target.id; });
    //https://stackoverflow.com/questions/16568313/arrows-on-links-in-d3js-force-layout/16568625
    marker = marker
    .enter()
    .append("marker")
    .style("fill", "#000")
    // Markers are IDed by link source and target's name.
    // Spaces stripped because id can't have spaces.
    .attr("id", function (d) { return (d.source.id + "-" + d.target.id).replace(/\s+/g, ''); })
    // Since each marker is using the same data as each path, its attributes can similarly be modified.
    // Assuming you have a "value" property in each link object, you can manipulate the opacity of a marker just like a path.
    .style("opacity", function (d) { return Math.min(d.value, 1); })
    .attr("viewBox", "0 -5 10 10")
    // refX and refY are set to 0 since we will use the radius property of the target node later on, not here.
    .attr("refX", 0) 
    .attr("refY", 0)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .merge(marker);
    
    console.log("HOW FAR DID WE GET?")
    let path = svg.append("g")
    .attr("class", "paths")
    .selectAll("path")
    .data(links, function (d) { return d.source.id + "-" + d.target.id; });

    path = path
      .enter()
      .append("path")
      .attr("class", "enter")
      .style("fill", "none")
      .style("stroke", "#000")
      .style("stroke-opacity", function (d) { return Math.min(d.value, 1); })
      // This is how to connect each path to its respective marker
      .attr("marker-end", function(d) { return "url(#" + (d.source.id + "-" + d.target.id).replace(/\s+/g, '') + ")"; })
      .merge(path);
    // Update and exit are omitted.
    // Enter

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
      console.log("HOW FAR DID WE GET?")

  console.log(graphData.nodes)
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
      console.log(d.id)
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
      console.log(d.id)
      const select_node = data.filter(
        (transaction) => transaction.from_wallets === d.id || transaction.target === d.id
      );
      const balance = data.find(
        (transaction) => transaction.source === d.id);
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
        .force('links', d3.forceLink(graphData.links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2));

        simulation.on('tick', () => {
        path.attr('d', function(d) {
            var sourceNode = graphData.nodes.find(node => node.id === d.source.id);
            var targetNode = graphData.nodes.find(node => node.id === d.target.id);
        return `M ${sourceNode.x},${sourceNode.y} L ${targetNode.x},${targetNode.y}`;
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
        path.attr('d', (d) => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`);
        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    
        const centerNode = graphData.nodes.find((node) => node.id === walletId);
        if (centerNode) {
            const dx = width / 2 - centerNode.x;
            const dy = height / 2 - centerNode.y;
    
            // Update transform attribute of 'g' element.
            svg.attr('transform', `translate(${margin.left + dx},${margin.top + dy})`);
        }
       
    } 


  }, [data, datanodes, walletId]);*/
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
            {balancenode.source}
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
                {transaction.source}
              </div>
              <div key={index + "-receiver"} className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
                {transaction.target}
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
      {transaction.source}
    </div>
    <div key={index + "-receiver"} className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
      {transaction.target}
    </div>
    <div key={index + "-action"} className="overflow-hidden whitespace-nowrap text-overflow[ellipsis] max-w-[100px]">
      {transaction.amount}
    </div>
  </>
))}
</div>*/