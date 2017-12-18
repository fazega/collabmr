/*var imported = document.createElement('script');
imported.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
document.head.insertBefore(imported, document.head.children[0]);*/

var url = "http://api.mapmine.fr"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



var attemptCount = 0;
function work() {
    $.get( url+"/work", function( packet ) {
      if(packet != "") {
        attemptCount = 0;

        var gradient = gradientFromWeights(packet.weights);
        var x = {gradient:gradient[0], cost:gradient[1], accuracy:gradient[2]};

        $.post(url+"/jobDone", JSON.parse(JSON.stringify(x)));
        work();

      }
      else {
        attemptCount++;
        console.log("No work to do for now ... Attempt : "+attemptCount);
        setTimeout(function() {work()}, 1000);
      }

  });
}
work();
