rb = new rainbow.Colors(377);

$(document).ready(function() {
  $('body').css({
    height: "100vh",
    width: "100vw"
  });
  $('body').on('click', function (){
    $('body').css({backgroundColor: rb.get()});
  });
});
