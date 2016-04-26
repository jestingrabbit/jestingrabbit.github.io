rb = new rainbow.Colors({fraction: 0.5});

$(document).ready(function() {
  $('body').css({
    height: "100vh",
    width: "100vw"
  });
  $('body').on('click', function (){
    $('body').css({backgroundColor: rb.get()});
  });
});
