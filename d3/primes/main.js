var data = {

  primes: [],

  primeDivisorsArray: function (max) {
    if (!max) {
      max = 1000;
    }
    var array = _.map(_.range(max), function (num) {
      return {
        num: num+1,
        primeDivisors: []
      };
    });
    for(var i = 1; i < array.length; i++){
      var n = array[i];
      if (n.primeDivisors.length === 0) {
        var prime = n.num;
        data.primes.push(prime);
        for(var j = i; j < max; j +=prime){ // i is current index != current number
          array[j].primeDivisors.push(prime);
        }
    //   else if (n.primDivisors.length === [1])  // we're a prime power, like 2^5 or 3^34 or whatever.
    //   make this block if we ever worry about multiplicity of prime divisors
      }
    }
    return array;
  }
};

data.array = data.primeDivisorsArray(10000);

var flower = {
  drawer

}
