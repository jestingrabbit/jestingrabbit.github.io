
var spiralData = [];

for (var i = 0; i < 10000; i++) {
  spiralData.push({
    r: 3*Math.sqrt(i),
    theta: Math.PI*(Math.sqrt(5)-1)*i/100
  });
}

var svgElement = d3.select('body')
  .append('svg')
  .attr("width", "100vw")
  .attr("height", "100vh");

var height = svgElement.node().getBoundingClientRect().height;
var width = svgElement.node().getBoundingClientRect().width;

var spiralFunction = d3.svg.line()
  .x(function(d){ return width/2 +d.r*Math.cos(d.theta);})
  .y(function(d){ return height/2 +d.r*Math.sin(d.theta);})
  .interpolate("linear");

  console.log(svgElement.node().getBoundingClientRect());

var lineGraph = svgElement.append("path")
  .attr("d", spiralFunction(spiralData))
  .attr("stroke", "blue")
  .attr("stroke-width", 1)
  .attr("fill", "none");

//
// //The data for our line
// var lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
//                  { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
//                  { "x": 80,  "y": 5},  { "x": 100, "y": 60}];
//
// //This is the accessor function we talked about above
// var lineFunction = d3.svg.line()
//                          .x(function(d) { return d.x; })
//                          .y(function(d) { return d.y; })
//                          .interpolate("linear");
//
// //The SVG Container
// var svgContainer = d3.select("body").append("svg")
//                                      .attr("width", 200)
//                                      .attr("height", 200);
//
// //The line SVG Path we draw
// var lineGraph = svgContainer.append("path")
//                              .attr("d", lineFunction(lineData))
//                              .attr("stroke", "blue")
//                              .attr("stroke-width", 2)
//                              .attr("fill", "none");
