var i = 0;

var watchID = navigator.geolocation.watchPosition( function(_) {
  i++;
},
null, {enableHighAccuracy: true});

setTimeout( function () {
  navigator.geolocation.clearWatch(watchID);
  document.body.innerHTML = "<h1>" + i + "</h1>";
  console.log("done");
}, 60000);
