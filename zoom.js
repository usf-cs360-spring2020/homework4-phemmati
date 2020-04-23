function createZoom(data_csv, type) {

  let width = 960;
  let height = 500;
  let pad = 100;
  let diameter = 600;
  let r = 20;

  // setup svg width and height
  let svg = d3.select("body").select("svg#spacefilling")
    //d3.select(DOM.svg(width, height))
    .style("width", width)
    .style("height", height);

  // shift (0, 0) a little bit to leave some padding
  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad + 50, pad - 50));

  let old_nested_data = d3.nest()
    .key(function(d) {
      return d["Neighborhooods"];
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

  let nested_data = old_nested_data.filter(function(d) {
     return d.key == type;
  });

  root = nested_data[0].key;

  let data = d3.hierarchy(nested_data[0], function(d) {
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
    let circles = d3.selectAll('circle').remove();
    d3.select("#tooltip").remove();
    d3.selectAll("text.legend-text").remove();
    
  }

  function setupEvents(g, selection, raise) {

    function showTooltip(g, node) {
      let gbox = g.node().getBBox(); 
      let nbox = node.node().getBBox(); 
      
      let dx = nbox.width / 2;
      let dy = nbox.height / 2;

      
      let x = nbox.x + dx;
      let y = nbox.y + dy;

      
      let datum = node.datum();

      
      let name = datum.data.key;

      
      numberFormat = d3.format(".2~s");
      let text = `${name} (${numberFormat(datum.value)} cases)`;

      //tooltip
      let tooltip = g.append('text')
        .text(text)
        .attr('x', x)
        .attr('y', y)
        .attr('dy', -dy - 4)
        .attr('text-anchor', 'middle') 
        .attr('id', 'tooltip');

      
      let tbox = tooltip.node().getBBox();

      
      if (tbox.x < gbox.x) {
        tooltip.attr('text-anchor', 'start');
        tooltip.attr('dx', -dx); // nudge text over from center
      }

      else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
        tooltip.attr('text-anchor', 'end');
        tooltip.attr('dx', dx);
      }

      if (tbox.y < gbox.y) {
        tooltip.attr('dy', dy + tbox.height);
      }
    }


    // show tooltip text on mouseover (hover)
    selection.on('mouseover.tooltip', function(d) {
      let selected = d3.select(this);
      let arr = selected._groups;
      let arr2 = arr[0];
      if (arr2[0].id !== "") {
        showTooltip(g, d3.select(this));
      }
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
    .attr("r", 4)
    .style("fill", "rgb(68, 1, 84)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 350)
    .attr("cy", height - 250)
    .attr("r", 4)
    .style("fill", "rgb(33, 145, 140)")
    .style("stroke", "black")
  svg.append("circle")
    .attr("cx", width - 350)
    .attr("cy", height - 300)
    .attr("r", 4)
    .style("fill", "rgb(253, 231, 37)")
    .style("stroke", "black")

  //add text
  svg.append("text")
    .attr("class", "legend-text")
    .attr("x", width - 330)
    .attr("y", height - 200)
    .text("Call Type Group")
    .attr("alignment-baseline", "middle")
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 330)
    .attr("y", height - 250)
    .text("Call Type")
    .attr("alignment-baseline", "middle")
  svg
    .append("text")
    .attr("class", "legend-text")
    .attr("x", width - 330)
    .attr("y", height - 300)
    .text("Neighborhood")
    .attr("alignment-baseline", "middle")
}