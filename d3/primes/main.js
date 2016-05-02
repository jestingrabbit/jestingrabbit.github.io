var data = {

  max: 1000,
  primes: [1], //its not really a prime, but its convenient for us here today.

  primeDivisorsArray: function (max) {
    if (!max) {
      max = data.max;
    }
    var array = _.map(_.range(max), function (num) {
      return {
        num: num+1,
        primeDivisors: [1],
      };
    });
    for(var i = 1; i < array.length; i++){ //sieve of erastosthenes.
      var n = array[i];
      if (n.primeDivisors.length === 1) {
        var prime = n.num;
        data.primes.push(prime);
        for(var j = i; j < max; j +=prime){ // i is current index != current number
          array[j].primeDivisors.push(prime);
        }
    //   else if (n.primeDivisors.length === 2)  // we're a prime power, like 2^5 or 3^34 or whatever.
    //   make this block if we ever worry about multiplicity of prime divisors
      }
    }
    return array;
  }
};
data.array = data.primeDivisorsArray(); // makes an array of {num: n, primeDivisors: [of n]}

var timing = {
  parabola: function (object) { // something to make the color changes move at constant change in radius.
    var start = object.start;
    var end = object.end;
    var duration = end - start;
    var C = data.max/(duration * duration);
    return function (t) {
      if (t < start) {
        return 0;
      } else if (start <= t <= end){
        return C*(t-start)*(t-start);
      } else {
        return data.max;
      }
    }
  },
  actionDuration: 5000,
  padding: 1000,
  currentIndex: 0
};
timing.startsAndEnds = (function () { // for each prime, we highlight the numbers divisible by it
// over a period of time described by this array. (the iife returns an array... scoping issues...)
  var startsAndEnds = [];
  var basicTotalDuration = timing.actionDuration + timing.padding;
  var lastActionCompletedAt = 0;
  for (var i = 0; i < data.primes.length; i++) {
    var p = data.primes[i];
    startsAndEnds.push({
      start: lastActionCompletedAt,
      end: lastActionCompletedAt + timing.actionDuration/p
    });
    lastActionCompletedAt += basicTotalDuration/p;
  }
  return startsAndEnds;
})();
timing.easings = _.map(timing.startsAndEnds, timing.parabola);
timing.timeToTurnOff = _.last(timing.startsAndEnds).end; // fin

var circle = function(svg) {
  return {
    attrs: function (d) {
      var n = d.num;
      var radius = Math.sqrt(n - 0.7);
      var angle = n * 4 * Math.PI /(3+ Math.sqrt(5)); // a (phi)th of the whole circle * n
      return {
        cx: svg.scaleX(radius * Math.cos(angle)), // theoretical phyllotaxis spiral position tweaked slightly.
        cy: svg.scaleY(radius * Math.sin(angle)),
        r: svg.dilation * 0.7
      }
    },

    rb: new rainbow.Colors({fraction: 0.55}), // an auto color selector thing I noodled around with
    rbColors: ["white"],                      // runs on naive brightness, Y, rather than Y', so it looks a bit off.

    color: function (d, currentPrime, t) { // uses the prime that we're currently representing to work out the color
      var easing = timing.easings[timing.currentIndex]; // for the current circle.

      if (d.num < easing(t)) {
        var index = d.primeDivisors.filter(function (p) {
          return p <= currentPrime;
        }).length;
      } else {
        var index = d.primeDivisors.filter(function (p) {
          return p < currentPrime;
        }).length;
      }
      return circle.rbColors[index];
    },
    finalColor: function (d) { // how freaking difficult is it to force the compiler to color the last few primes!!!
      return circle.rbColors[d.primeDivisors.length];
    }
  }
};

$(document).ready( function () { // with the display depending on the size of the window,
                                 // leaving display stuff here makes some sense.
  var svg = {
    element: d3.select('body')
    .append('svg')
    .attr("width", "100vw")
    .attr("height", "99vh"),
  };

  svg.height = svg.element.node().getBoundingClientRect().height,
  svg.width = svg.element.node().getBoundingClientRect().width,
  svg.smallestDimensionSize = (svg.height < svg.width)? svg.height: svg.width;
  svg.dilation = 0.5 * svg.smallestDimensionSize/(Math.sqrt(data.max) + 1);

  svg.scaleX = function (x) { // maybe could have used the d3 scales, but couldn't see how in this instance.
    return svg.dilation*x + svg.width/2;
  };
  svg.scaleY = function (x) {
    return svg.dilation*x + svg.height/2;
  };

  circle = circle(svg); // depends on svg width and height, which depends on the viewport size

  var prod = 1; // work out how many colors we need and go get them.
  for (var numColors = 0; prod < data.max; numColors++) {
    prod *= data.primes[numColors];
  }
  while (circle.rbColors.length <= numColors){
    circle.rbColors.push(circle.rb.get());
  }

  svg.circles = svg.element //make the circles
    .selectAll('circle')
    .data(data.array)
    .enter()
    .append('circle')
    .each(function (d) {
      d3.select(this)
        .attr(circle.attrs(d))
        .style('fill', circle.rbColors[0]);
    });

  $('body').on('click', function () {
    $('body').off();
    function step(timestamp) { // update circle colors
      if (!timing.start) {
        timing.start = timestamp;
      }
      var progress = timestamp - timing.start;

      while ((progress < timing.timeToTurnOff) // workout where we are in the animation.
          && (timing.currentIndex + 1 < timing.startsAndEnds.length)
          && (progress > timing.startsAndEnds[timing.currentIndex + 1].start)){
        timing.currentIndex++;
      }

      var currentPrime = data.primes[timing.currentIndex]; // which prime are we talking about atm

      if (progress < timing.timeToTurnOff) {
        svg.circles
          .each(function (d) {
            d3.select(this)
              .style('fill', circle.color(d, currentPrime, progress)); // where the action happens
          })
        window.requestAnimationFrame(step);
      } else {
        console.log(currentPrime);
        svg.circles
          .each(function (d) {
            console.log(d.num);
            d3.select(this)
              .style('fill', circle.finalColor(d));
          }); // was so difficult to get this to reliably do the right thing for the last 4 primes...
              // hence finalColor and logging and... grrrr.
        window.cancelAnimationFrame(timing.animId);
        delete timing.animId;
      }
    }

    timing.animId = window.requestAnimationFrame(step);
  });
});
