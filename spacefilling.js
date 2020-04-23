function create(data_csv) {


  var width = 960,
      height = 500,
      pad = 100,
      diameter = 600,
      r = 20;

  // setup svg width and height
  var svg = d3.select("body").select("#spacefilling")
    .style("width", width)
    .style("height", height);

  
  var plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad + 50, pad -50));

  let parent = d3.nest()
    .key(function(d) {
      return d["City"];
    })
    .key(function(d) {
      return d["Neighborhooods"]
    })
    .key(function(d) {
      return d["Call Type Group"]
    })
    .key(function(d) {
      return d["Call Type"]
    })
    .rollup(function(v) {
      return v.length;
    })
    .entries(data_csv);
    
  root = parent[0].key;

  var data = d3.hierarchy(parent[0], function(d) {
    return d.values;
  });

  data.count()
  data.sum(d => d.value);

  data.sort(function(a, b) {
    return b.height - a.height || b.count - a.count;
  });

  let layout = d3.pack()
    .padding(r)
    .size([diameter - 2 * pad, diameter - 2 * pad]);

  layout(data);
    
  myColor = d3.scaleSequential([data.height, 0], d3.interpolateViridis)
    
  drawNodes(plot.append("g"), data.descendants(), false);
    
  function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
  }


  function drawNodes(g, nodes, raise) {

    let circles = g.selectAll('circle')
      .data(nodes, node => node.data.key)
      .enter()
      .append('circle')
      .attr('r', d => d.r ? d.r : r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.key)
      .attr('class', 'node')
      .style('fill', d => myColor(d.depth))
      .style('stroke', 'black')
      .on("click", function(d) {
        if (focus !== d) zoom(d), d3.event.stopPropagation();
      });

    let empty = circles.filter(d => (d.data.key === ""))
      .style("stroke", "")
      .attr("fill-opacity", "0")

    setupEvents(g, circles, raise);
  }

  function zoom(d) {
    //console.log(d);
    if (d.height == 2) {
      let circles = d3.selectAll('circle').remove();
      d3.select("#tooltip").remove();
      d3.selectAll("text.legend-text").remove();
      createZoom(data_csv, d.data.key);
    }

    if (d.height == 1) {
      let circles = d3.selectAll('circle').remove();
      d3.select("#tooltip").remove();
      d3.selectAll("text.legend-text").remove();
      createZoom(data_csv, d.parent.data.key);
    }

  }

  function setupEvents(g, selection, raise) {

    function showTooltip(g, node) {
      let gbox = g.node().getBBox(); // get bounding box of group BEFORE adding text
      let nbox = node.node().getBBox(); // get bounding box of node

      // calculate shift amount
      let dx = nbox.width / 2;
      let dy = nbox.height / 2;

      // retrieve node attributes (calculate middle point)
      let x = nbox.x + dx;
      let y = nbox.y + dy;

      // get data for node
      let datum = node.datum();

      // remove "java.base." from the node name
      let name = datum.data.key;

      // use node name and total size as tooltip text
      numberFormat = d3.format(".2~s");
      let text = `${name} (${numberFormat(datum.value)} cases)`;

      // create tooltip
      let tooltip = g.append('text')
        .text(text)
        .attr('x', x)
        .attr('y', y)
        .attr('dy', -dy - 4) // shift upward above circle
        .attr('text-anchor', 'middle') // anchor in the middle
        .attr('id', 'tooltip');
    
     // get bounding box for the text
      let tbox = tooltip.node().getBBox();

      // if text will fall off left side, anchor at start
      if (tbox.x < gbox.x) {
        tooltip.attr('text-anchor', 'start');
        tooltip.attr('dx', -dx); // nudge text over from center
      }
      // if text will fall off right side, anchor at end
      else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
        tooltip.attr('text-anchor', 'end');
        tooltip.attr('dx', dx);
      }

      // if text will fall off top side, place below circle instead
      if (tbox.y < gbox.y) {
        tooltip.attr('dy', dy + tbox.height);
      }
    }


    // show tooltip text on mouseover (hover)
    selection.on('mouseover.tooltip', function(d) {
      let selected = d3.select(this);
      showTooltip(g, d3.select(this));

    })

    // remove tooltip text on mouseout
    selection.on('mouseout.tooltip', function(d) {
      g.select("#tooltip").remove();
    });

    selection.on('click.tooltip', function(d) {
      let selected = d3.select(this);
      let arr = selected._groups;
      let arr2 = arr[0];

     
    });
  }

 
  
  ///add legend
  //add color circles
  svg.append("circle")
    .attr("cx", width - 350)
    .attr("cy", height - 200)
    .attr("r", 5)
    .style("fill", "rgb(253, 231, 37)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 350)
    .attr("cy", height - 250)
    .attr("r", 5)
    .style("fill", "rgb(53, 183, 121)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 350)
    .attr("cy", height - 300)
    .attr("r", 5)
    .style("fill", "rgb(49, 104, 142)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 350)
    .attr("cy", height - 350)
    .attr("r", 5)
    .style("fill", "rgb(68, 1, 84)")
    .style("stroke", "black")



  //add text
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 330)
    .attr("y", height - 200)
    .text("City")
    .attr("alignment-baseline", "middle")
  svg.append("text")
    .attr("class", "legend-text")
    .attr("x", width - 330)
    .attr("y", height - 250)
    .text("Neighborhood")
    .attr("alignment-baseline", "middle")
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 330)
    .attr("y", height - 300)
    .text("Call Type Group")
    .attr("alignment-baseline", "middle")
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 330)
    .attr("y", height - 350)
    .text("Call Type")
    .attr("alignment-baseline", "middle")
 

}