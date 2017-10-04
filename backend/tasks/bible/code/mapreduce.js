function map(data) {
  /* count the number of words in the body of document */
  var mapped = new Map();
  for(var word of data.split(" ")) {
    if(!mapped.has(word)) {
        mapped.set(word, ["1"]);
    }
    else {
      mapped.get(word).push("1");
    }
  }
  return JSON.stringify([...mapped]);
}

function reduce(data) {
  /* sum up all the word counts */
  var l = JSON.parse(data);
  var reduced = new Map();
  for(var entry of l) {
    reduced.set(entry[0], entry[1].length);
  }
  return JSON.stringify([...reduced]);
}
