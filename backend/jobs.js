var clients = new Array();

var toMap = [];
var toSort = [];
var sortMap = new Map();
var toReduce = [];

var reduced = [];

function randomId() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

exports.getWork = function(data) {
  if(!clients.includes(data.id))
    clients.push(randomId())

  if(toMap.length != 0) {
    var mapData = toMap.pop();
    return {rawData: mapData.rawData, dataId:mapData.dataId, job:"map"};
  }
  else if(toReduce.length != 0) {
    var reduceData = toReduce.pop();
    return {rawData: reduceData.rawData, dataId:reduceData.dataId, job:"reduce"};
  }
  else {
    return {data:null, dataId:null, job:null};
  }
}

exports.split = function(data) {
  var chunks = chunkSubstr(data, data.length/3)
  for(var chunk of chunks) {
    toMap.push({rawData:chunk, dataId: randomId()})
  }
  return;
}

function chunkSubstr(str, size) {
  var numChunks = Math.ceil(str.length / size),
      chunks = new Array(numChunks);

  for(var i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}


exports.jobDone = function(data) {
  if(data.job == "map") {
    newToSort(data.rawData);
    return "Request valid";
  }
  else if(data.job == "reduce") {
    reduced.push({rawData:data.rawData, dataId: data.dataId});
    console.log("Reduced : "+reduced[0].rawData);
    return "Request valid";
  }
  else {
    return "Bad format";
  }
}

function newToSort(data) {
  toSort.push(JSON.parse(data));
  if(toSort.length == 3) {
    var entire = [];
    for(var data of toSort) {
      entire = entire.concat(data);
    }

    var final = new Map();
    for(var entry of entire) {
      if(final.has(entry[0])) {
        final.set(entry[0], final.get(entry[0])+["1"])
      }
      else {
        final.set(entry[0], ["1"]);
      }
    }
    toReduce.push({rawData:JSON.stringify([...final]), dataId:data.dataId});
  }
}
