var spaceCircles = [30, 70, 110];

var svgSelection = d3.select('body').append('svg')
  .attr("width", "100vw")
  .attr("height", "100vh");


var circles = svgSelection.selectAll('circle')
  .data(spaceCircles)
  .enter()
  .append('circle');

var circleAttrs = circles
  .attr('cx', function(d){return d;})
  .attr('cy', function(d){return d;})
  .attr('r', 20)
  .style('fill', function(d){
    return "rgb("+Math.round(d*255/100)+", 0, 0)";
  });
