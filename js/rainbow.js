var vector = {
  sum: function (a, b) {
    var c = [];
    for (var i = 0; i < a.length; i++) {
      c.push(a[i] + b[i]);
    }
    return c;
  },

  diff: function (a, b) {
    var c = [];
    for (var i = 0; i < a.length; i++) {
      c.push(a[i] - b[i]);
    }
    return c;
  },

  scalarMult: function (s, a) {
    return _.map(a, function (n) {return n*s;});
  },

  signDiff: function (a, b) {
    var c = this.diff(b, a);
    var diff = _.map(c, Math.sign);
    return diff;
  }
};

vector.add = vector.sum;

var fibonacci = {
  numbers: function (max) {
    var array = [0, 1];
    var i = 1;
    while (array[i] < max) {
      array.push(array[i] + array[i-1]);
      i++;
    }
    return [array[i], array[i-2]];
  }
}

var rainbow = {
  interval: function (a, b, verbose) {
    var size = _.chain(vector.diff(a, b))
      .map(Math.abs)
      .max()
      .value();
    var step = vector.signDiff(a, b);
    var interval = [];
    for (var i = 0; i < size; i++) {
      interval.push(vector.sum(a, vector.scalarMult(i, step)));
    }
    if (verbose) {
      return {
        interval: interval,
        step: step
      }
    } else {
      return interval;
    }
  },

  brightness: function (brightness, verbose) {
    if (brightness > 764){
      return [[255, 255, 255]];
    } else if (brightness < 1) {
      return [[0,0,0]];
    } else {
      b = Math.round(brightness);
    }

    if (b <= 255){
      vertices = [
        [b, 0, 0],
        [0, b, 0],
        [0, 0, b]
      ];
    } else if (b >= 510) {
      c = b - 510;
      vertices = [
        [c, 255, 255],
        [255, c, 255],
        [255, 255, c]
      ];
    } else {
      c = b - 255;
      vertices = [
        [255, c, 0],
        [255, 0, c],
        [c, 0, 255],
        [0, c, 255],
        [0, 255, c],
        [c, 255, 0]
      ];
    }
    if (verbose) {
      return _.chain(vertices)
        .map( function (__, i, v) {
          return rainbow.interval(v[i], v[(i+1)%v.length], verbose);
        })
        .value();
    } else {
      return _.chain(vertices)
        .map( function (__, i, v) {
          return rainbow.interval(v[i], v[(i+1)%v.length]);
        })
        .flatten(1)
        .value();
    }
  },

  makeHalfStep: function (brightness, step) {
    if (brightness < 383) {
      return _.map(step, function (num) {
        return (num<0)? 0: num;
      });
    } else {
      return _.map(step, function (num) {
        return (num > 0)? 0: num;
      });
    }
  },

  extraPointHere: function (totalSize, extraPoints, i) {
    return Math.floor((i/totalSize) * extraPoints + 0.5) -
         Math.floor(((i+1)/totalSize) * extraPoints + 0.5);
  },

  perfect: function (brightness) {
    var rb = rainbow.brightness(brightness, true);
    var intervalSizes = _.map(rb, function (io){
      return io.interval.length;
    });
    var totalSize = _.reduce(intervalSizes, function (a,b){
      return a+b;
    }, 0);

    var fibbs = fibonacci.numbers(totalSize);
    var newSize = fibbs[0];
    var extraPoints = newSize - totalSize;
    var returnStep = fibbs[1];

    var newRb = [];
    var whichInterval = 0;
    var i = 0;

    while (whichInterval < rb.length) {
      var halfStep = rainbow.makeHalfStep(brightness, rb[whichInterval].step);
      var thisInterval = rb[whichInterval].interval;

      for (j = 0; j < thisInterval.length; j++){
        newRb.push(thisInterval[j]);

        if (rainbow.extraPointHere(totalSize, extraPoints, i)) {
          newRb.push(vector.sum(thisInterval[j], halfStep))
        }
        i++;
      }
      whichInterval++;
    }
    return {
      rainbow: newRb,
      step: returnStep
    }
  },

  Colors: function (brightness) {
    if (brightness === 'dark') {
      this.brightness = 255;
    } else if (brightness === 'light') {
      this.brightness = 510;
    } else {
      this.brightness = Math.round(brightness);
    }

    this.position = 0;

    var rbAndStep = rainbow.perfect(this.brightness);
    this.rb = rbAndStep.rainbow;
    this.step = rbAndStep.step;

    this.get = function () {
      this.position = (this.position + this.step) % this.rb.length;
      var color = this.rb[this.position];
      return "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
    }
  }
};
