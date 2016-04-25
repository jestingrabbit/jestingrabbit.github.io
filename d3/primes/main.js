var data = {

  primes: [];

  primeDivisors: function (max) {
    if (!max) {
      max = 1000;
    }
    var data = _.map(_.range(max), function (num) {
      return {
        num: num,
        PDs: []
      }
    });
    for(var i = 2; i < data.length; i++){
      n = data[i];
      if (n.primeDivisors.length === [0]) {
        var prime = n.num;
        data.primes.push(prime);
        for(var j = prime; j < max; j +=prime){
          data.primeDivisors[j].PDs.push([prime, 1]);
        }
      } else if (n.primDivisors.length === [1]) { // we're a prime power, like 2^5 or 3^34 or whatever.
        
      }

    }


  }

};

var flowerDrawer = {

}
