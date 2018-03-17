/*var imported = document.createElement('script');
imported.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
document.head.insertBefore(imported, document.head.children[0]);*/
var url = "http://api.mapmine.fr";
importScripts('http://api.mapmine.fr/static/math.min.js');
importScripts('http://api.mapmine.fr/static/crypto.js')
importScripts('http://api.mapmine.fr/static/nn_computing.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function getXHR() {
  var xhr;

  if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
  else {
    var versions = ["MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"]

    for(var i = 0, len = versions.length; i < len; i++) {
    try {
      xhr = new ActiveXObject(versions[i]);
      break;
    }
      catch(e){}
    } // end for
  }
  return xhr;
}

function httpGet(url, callback) {
  var xhr = getXHR();
  xhr.onreadystatechange = ensureReadiness;

  function ensureReadiness() {
    if(xhr.readyState < 4) {
      return;
    }

    if(xhr.status !== 200) {
      return;
    }

    // all is well
    if(xhr.readyState === 4) {
      if(xhr.responseText=="")
        callback("")
      else
        callback(JSON.parse(xhr.responseText));
    }
  }
	xhr.open('GET', url, true);
	xhr.send('');
}

function httpPost(url,data, callback) {
  var xhr = getXHR();
  xhr.onreadystatechange = ensureReadiness;

  function ensureReadiness() {
    if(xhr.readyState < 4) {
      return;
    }

    if(xhr.status !== 200) {
      return;
    }

    // all is well
    if(xhr.readyState === 4) {
      if(xhr.responseText=="")
        callback("")
      else
        callback(JSON.parse(xhr.responseText));
    }
  }
	xhr.open('POST', url, true);
  xhr.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
	xhr.send(JSON.stringify(data));
}



var attemptCount = 0;
function work() {
    httpGet( url+"/work", function( packet ) {
      if(packet != "") {
        attemptCount = 0;

        var gradient = gradientFromWeights(packet.weights, packet.chunk.data.map((x)=>{let v = new encryptedVector();v.enc = math.matrix(x.map((y)=>{let v2 = new encryptedNb();v2.enc=math.matrix(y);return v2;}));return v;}));
        var x = {id:packet.id, idChunk:packet.chunk.id, gradient:gradient[0], cost:gradient[1]};
        httpPost(url+"/jobDone", JSON.parse(JSON.stringify(x)), function(a) {});
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
