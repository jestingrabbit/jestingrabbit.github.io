var catImg = document.getElementsByTagName('img')[0];

catNegInfinityX = 0;
catZeroXDisplace = 136;
catNegInfinityY = 300;
catZeroYDisplace = -147;
catZeroHeight = 296;
catNegInfinityWidthMul = 1/catZeroHeight;
orientation = 1

lambda = 0.2215; // some sort of speed variable, set by hand.
catMinTime = 1000 * Math.log(1/catZeroHeight)/lambda; //

setCat = function (ms) { // at time in ms
  multiplicativeFactor = Math.exp(lambda*ms/1000);

  catImg.height = catZeroHeight * multiplicativeFactor;
  catImg.style.top = Math.round(catNegInfinityY + multiplicativeFactor * catZeroYDisplace)+"px";
  if (orientation === 1){
    catImg.style.left = Math.round(catNegInfinityX + multiplicativeFactor * catZeroXDisplace)+"px";
  } else {
    catImg.style.transform = " scaleX(-1)";
    catImg.style.right = Math.round(catNegInfinityX + multiplicativeFactor * catZeroXDisplace)+"px";
  }
}

var resetCat = function () { //reset the cat via all values touched.
  catImg.height = 0;
  catImg.style.top = "";
  catImg.style.left = "";
  catImg.style.right = "";
  catImg.style.transform = "";
}

var catWalkOnceAndThen = function (controlPasser, start, stop, deltaT) { //milliseconds
  start = start || catMinTime;
  stop = stop || 1000*Math.log(window.innerWidth/catZeroXDisplace)/lambda;
  deltaT = deltaT || 10;
  t = start;

  var setCatAndTime = function() {
    t += deltaT;
    setCat(t);
    if (t> stop) {
      clearInterval(timerID);
      resetCat();
      if (controlPasser) {
        controlPasser.func.apply(null, [controlPasser.next]);
      } else {
        console.log("finished");
      }
    }
  }
  timerID = setInterval(setCatAndTime, deltaT);
}

// repeat = {
//  func: catWalkOnceAndThen
// }
// repeat.next = repeat;
//
// catWalkOnceAndThen(repeat);

var changeDirectionAndWalkAndThen = function (controlPasser) {
   orientation *= -1;
  //  if (orientation === 1) {
  //    catImg.style.transform = "";
  //  } else if (orientation === -1) {
  //    catImg.style.transform = " scaleX(-1)";
  //  }
   catWalkOnceAndThen(controlPasser);
}

// repeat = {
//   func: changeDirectionAndWalkAndThen
// }
// repeat.next = repeat;
// changeDirectionAndWalkAndThen(repeat);

var catMaxTime;

var setCatMaxTime = function () {
  catMaxTime = 1000*Math.log(window.innerWidth/catZeroXDisplace)/lambda;
}

var catRandomWalk = function (controlPasser) {
  setCatMaxTime();
  start = catMinTime + (catMaxTime - catMinTime) * Math.random();
  end = start + (catMaxTime - start) * Math.random();
  orientation = (Math.random() > 1/2) ? 1 : -1;
  // if (Math.random() > 1/2) {
  //   orientation = 1;
  // } else {
  //   orientation = -1;
  // }
  catWalkOnceAndThen(controlPasser, start, end);
}

// repeat = {
//   func: catRandomWalk
// }
// repeat.next = repeat;
// catRandomWalk(repeat);

var randomRGBAString = function () {
  return "rgba( "+Math.round(Math.random()*255)+" , "
    +Math.round(Math.random()*255)+" , "
    +Math.round(Math.random()*255)+" , "
    +Math.random()+" ) "
}

var randomDegreeString = function () {
  return Math.round(Math.random()*360)+"deg"
}

var randomGradientString = function () {
  return "linear-gradient( " +
    randomDegreeString() +" , "+randomRGBAString()+" , "+randomRGBAString()+" )"
}

var reallyRandomWalk = function (controlPasser) {
  string = randomGradientString();
  console.log(string);
  document.body.style.background = string;
  console.log(document.body.style.background);
  catRandomWalk(controlPasser);
}

repeat = {
  func: reallyRandomWalk
}
repeat.next = repeat;

controlPasser = {
  func: catWalkOnceAndThen,
  next: {
    func: catWalkOnceAndThen,
    next:{
      func: changeDirectionAndWalkAndThen,
      next: {
        func: changeDirectionAndWalkAndThen,
        next: {
          func: catRandomWalk,
          next: {
            func: catRandomWalk,
            next: {
              func: catRandomWalk,
              next: repeat
            }
          }
        }
      }
    }
  }
}

catWalkOnceAndThen(controlPasser);
