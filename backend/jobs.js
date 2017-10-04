var fs = require('fs');

var clients = new Array();

var toMap = [];
var toSort = [];
var toReduce = [];


var CHUNK_SIZE = 5*1000*100 //500KO
var numberOfChunks = 0;

function randomId() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

var Chunk = function(id, data, job) {
  this.id = id;
  this.data = data;
  this.job = job;
}

var Task = function(name, chunks, code) {
  this.name = name;
  this.chunks = chunks;
  this.chunks_reduced = [];
  this.code = code;
  this.id = randomId();

  this.received = function(chunk) {
    this.chunks = this.chunks.filter((c)=>c.id!=chunk.id);
    if(chunk.job == "map") {
      chunk.job = "sort";
      this.chunks.push(chunk);
      this.attemptSort();
    }
    else if(chunk.job == "reduce") {
      this.chunks_reduced.push(chunk);
      this.chunks = this.chunks.filter((c)=>c.id!=chunk.id);
      if(this.chunks.length == 0) {
        console.log("\nTask "+name+" finished.");
        var treatedData = "";
        for(var chunk of this.chunks_reduced) {
          treatedData += chunk.data;
        }
        fs.writeFile("tasks/"+name+"/treatedData/treatedData.txt", treatedData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Results written in treatedData folder.");
        });
        console.log("Moved to treatedTasks.");
        fs.rename("tasks/"+name, "treatedTasks/"+name, function(err) {
          if(err) throw err;
        })
      }
    }
    else {
      return "Bad format.";
    }
  }

  this.attemptSort = function() {
    for(var chunk of this.chunks) {
      if(chunk.job != "sort") {
        return false;
      }

    }
    var entries = [];
    for(var chunk of this.chunks) {
      entries = entries.concat(JSON.parse(chunk.data));
    }
    var final = new Map();
    for(var entry of entries) {
      if(final.has(entry[0])) {
        var toset = final.get(entry[0]).concat(entry[1]);
        final.set(entry[0], toset)
      }
      else {
        final.set(entry[0], entry[1]);
      }
    }

    var rawData = JSON.stringify([...final]);
    this.chunks = [];
    for(var c of exports.split(rawData)) {
      this.chunks.push(new Chunk(randomId(), c, "reduce"));
    }
  }
}
var tasks = new Map();
//var tasks_done = new Map();

console.log("Loading data ...");
fs.readdir('tasks', (err, tasks_f) => {
  tasks_f.forEach(task_name => {
    var task = new Task(task_name, [], null);
    fs.readFile('tasks/'+task_name+'/data/data.txt', 'utf8', (err, data)=>{
      if(err) throw err;
      for(var c of exports.split(data)) {
        task.chunks.push(new Chunk(randomId(), c, "map"));
      }
    });
    fs.readFile('tasks/'+task_name+'/code/mapreduce.js', 'utf8', (err, data) =>{
      if (err) throw err;
      task.code = data;
    });
    tasks.set(task.id, task);
  });
});
console.log("Data read.")

/*for(var task of tasks.values()) {
  for(var chunk of task.chunks) {
    toMap.push({rawData: chunk, dataId:task.id, code:task.code, job:"map"})
  }
}*/

exports.getWork = function() {
  for(var task of tasks.values()) {
    if(task.chunks.length != 0) {
      for(var c of task.chunks) {
        if(c.job == "map" || c.job == "reduce") {
          return {chunk:task.chunks[0], code:task.code, taskId:task.id}
        }
      }
    }
  }
  return null;
}

exports.split = function(data) {
  var chunks = chunkSubstr(data, CHUNK_SIZE)
  return chunks;
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
  console.log(data)
  tasks.get(data.taskId).received(data.chunk);
  return "Request valid";
}

function newToSort(data) {
  toSort.push(JSON.parse(data));

}
