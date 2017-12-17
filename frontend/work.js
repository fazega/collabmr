

var imported2 = document.createElement('script');
imported2.src = "nn_computing.js";
document.head.appendChild(imported2);


var url = "http://api.mapmine.fr"

var attemptCount = 0;
function work() {
    $.get( url+"/work", function( packet ) {
      if(packet != "") {
        attemptCount = 0;

        var gradient = gradientFromWeights(packet.weights);

        $.post(url+"/jobDone", {gradient:gradient});
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
