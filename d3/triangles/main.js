var points = [];

var pointsToPoints = function() {
  var str = "";
  for (var i = 0; i < points.length; i++) {
    str += points[i].x + "," + points[i].y;
  }
  return str;
};

var lineFunction = d3.svg.line()
  .x(function(d){return d.x;})
  .y(function(d){return d.y;})
  .interpolate("linear");

var makeCircle = function(object) {
  var x = object.x;
  var y = object.y;
  svgCont.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 20)
    .attr('fill', 'red');
};

var svgCont;

$(document).ready(function () {
  svgCont = d3.select('body')
    .append('svg')
    .attr("width", "100vw")
    .attr("height", "100vh");

  $('svg').on('click', function(event){
    console.log(event);

    if (points.length < 3) {
      var point = {
        x: event.offsetX,
        y: event.offsetY
      };
      points.push(point);
      makeCircle(point);
    }
    if (points.length === 3) {
      points.push(points[0]);
      $('svg').text("");
      svgCont.append('path')
        .attr('d', lineFunction(points))
        .attr('stroke', 'none')
        .attr('fill', 'green');
    } else if (points.length === 4) {
      points = [];
      $('svg').text("");
    }
  });
});
