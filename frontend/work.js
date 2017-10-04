var imported = document.createElement('script');
imported.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
document.head.appendChild(imported);


var url = "http://localhost:8080"

var attemptCount = 0;
function work() {
    $.get( url+"/work", function( packet ) {
      if(packet != "") {
        eval(packet.code);
        attemptCount = 0;
        /*$("#data").html(data.rawData.length);
        $("#metaData").html("Job : "+data.job);*/
        var treatedData;
        if(packet.chunk.job == "map") {
          treatedData = map(packet.chunk.data);
        }
        else if(packet.chunk.job == "reduce") {
          treatedData = reduce(packet.chunk.data);
        }
        //$("#result").html(treatedData);
        $.post(url+"/jobDone", {chunk:{id:packet.chunk.id, data:treatedData, job:packet.chunk.job}, taskId:packet.taskId});
        work();
      }
      else {
        attemptCount++;
        $("#metaData").html("No work to do for now ... Attempt : "+attemptCount);
        setTimeout(function() {work()}, 1000);
      }

  });
}
work();
