var fs = require('fs');
var math = require('./math.min');

var clients = new Array();

function randInitializeWeights(layers){

    var num_of_layers = layers.length;
    var epsilon = 0.12;
    var Theta = []
	console.log("Theta shape:");
	console.log(layers[1],layers[0] + 1);
    for(i=0; i<num_of_layers-1; i++){
        var W = math.zeros(math.abs(layers[i+1]),math.abs(layers[i] + 1));

        for(j=0;j<W.size()[0];j++){

			for(k=0; k<W.size()[1];k++){
        var val = Math.random()*2*epsilon - epsilon;
				W._data[j][k]=(Math.round(val * 10000) / 10000);
			}
		}
        Theta.push(W)
    }
    return Theta;

}

var layers = [784, 100, 10]
var weights = randInitializeWeights(layers)

function applyGradient(weights_matrix, gradient_matrix) {
    var learning_rate = 0.01;

    var toreturn = weights_matrix.slice();
    for(var u = 0; u < weights_matrix.length;u++) {
      var M = weights_matrix[u];
      for(var i = 0; i < M._size[0]; i++) {
        for(var j = 0; j < M._size[1]; j++) {
          toreturn[u]._data[i][j] -= learning_rate*gradient_matrix[u].data[i][j]
          toreturn[u]._data[i][j] = (Math.round(toreturn[u]._data[i][j] * 10000) / 10000)
        }
      }
    }
    return toreturn;
}


exports.getWork = function() {
  return {weights:weights}
}


exports.jobDone = function(data) {
  weights = applyGradient(weights, data.gradient)
  return "Request valid";
}
