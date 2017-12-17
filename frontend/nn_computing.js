/*var imported = document.createElement('script');
imported.src = "math.min.js";
document.head.insertBefore(imported, document.head.children[0]);

var imported2 = document.createElement('script');
imported2.src = "bower_components/mnist/dist/mnist.js";
document.head.insertBefore(imported2, document.head.children[0]);*/





function read_dataset(size_training, size_testing){
	var total = size_training + size_testing;
	if(total > 10000){
		size_training = Math.floor(size_training*(total/10000));
		size_testing = Math.floor(size_testing*(total/10000));
	}
	var set = mnist.set(size_training, size_testing);
	var trainingSet = set.training;
	var testSet = set.test;
	return [trainingSet, testSet];
}



function predict(ThetaRes, X){
    var m = X.size()[0];
    var num_labels = ThetaRes[ThetaRes.length-1].size()[0];
    var num_layers = ThetaRes.length + 1;


    var p = [];

    for(k=0;k<m;k++){
        var h=math.matrix(X._data[k]);
        for(index=0;index<(num_layers-1);index++){
            h=sigmoid(math.multiply(ThetaRes[index],math.matrix([1].concat(h._data))));
		}
		var max = math.max(h);

		for(j=0; j<h.size()[0];j++){
			if(h._data[j] == max){
				p.push(j);
			}
		}

	}
	return p;
}
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
				W._data[j][k]=(Math.random()*2*epsilon - epsilon);
			}
		}
        Theta.push(W)
    }
    return Theta;

}

function roll_params(nn_params, layers){

    num_layers = layers.length;
    Theta = [];
    index = 0;
	for(i = 0; i < num_layers - 1; i++){
		step = layers[i+1]*(layers[i]+1);
		weights = math.matrix(math.subset(nn_params,math.index(math.range(index,index+step))));
		math.reshape(weights,[layers[i+1],layers[i]+1]);
		index = index + step;
		Theta.push(weights);
	}

	return Theta;
}

function unroll_params(Theta){
	var nn_params = [];
    for(i = 0 ; i<Theta.length; i++){
		for(k = 0; k<Theta[i].size()[0]; k++){
			for(l = 0; l<Theta[i].size()[1]; l++){
				nn_params.push(Math.round(Theta[i]._data[k][l] * 100) / 100);
			}
		}
	}
	//console.log("unroll param");
	//console.log(nn_params);
    return nn_params;
}

function sigmoidGradient(z){
	//console.log("gradient");
	//console.log(z);
	var n = z.size()[0];
	var g = sigmoid(z);
	for(j = 0; j<n; j++){
		g._data[j] = g._data[j]*(1-g._data[j]);
	}
	return g;
}

function sigmoid(z){
	var n = z.size()[0];
    var g = math.zeros(n);
	for(j = 0; j<n; j++){
		g._data[j] = (1.0)/(1.0+math.exp(-z._data[j]));
	}
    return g;
	}

function backwards2(Theta, layers, X, y, num_labels, lambd){

    var m = X.size()[0];
    var num_layers = layers.length;
	var Theta_grad = [];
	var J = 0;
	for(i=0;i<Theta.length;i++){
		Theta_grad.push(math.zeros(Theta[i].size()));
	}

    //console.log("debug back Theta");
	//console.log(Theta);

    // In this point implement the backpropagation algorithm
    for(i=0;i<m;i++){
	    A = [];
        Z = [];
        A.push(X._data[i]);
        Z.push([0]);
        for(j=0;j<num_layers-1;j++){
			Z.push(math.multiply(Theta[j],math.matrix([1].concat(A[j]))));
			//console.log("Xi");
			//console.log(X._data[i]);
            A.push(sigmoid(Z[j+1])._data);
		}

		// Cost computation for each training example (without regularization)
		for(k=0;k<num_labels;k++){

            J += (-1)*y._data[i][k]*math.log(A[A.length-1][k])-(1-y._data[i][k])*math.log(1-A[A.length-1][k]);
		}

        var D = [];
		temp = [];
		for(k=0; k<num_labels;k++){
			temp.push(A[A.length-1][k]-y._data[i][k]);
		}
        D.push(temp);
        var j=num_layers-2;
        while(j>0){
			var temp1 = math.subset(Theta[j],math.index(math.range(0,Theta[j].size()[0]),math.range(1,Theta[j].size()[1])));
		    var tempList = math.multiply(math.transpose(temp1),math.matrix(D[0]));
			var sig =sigmoidGradient(Z[j])._data;
			for(k=0; k<tempList.size()[0];k++){
				tempList._data[k] *= sig[k];
			}
			D=[tempList._data].concat(D);
			j--;
		}

        for(l=0;l<Theta_grad.length;l++){
			for(n =0; n<D[l].length;n++){
				D[l][n]*=1.0/m;
			}
			var  temp1 =math.transpose(math.matrix([D[l]]));
			//console.log(temp1);
			var temp2 =math.matrix([[1].concat(A[l])]);
			//console.log(temp2);
			var temp3 = math.multiply(temp1,temp2);
			//console.log(Theta_grad[l],temp3);
		    Theta_grad[l] = math.add(Theta_grad[l],temp3);
		}

	}

    //regularization

    for(i = 0; i<num_layers - 1; i++){
		var temp_matrix = Theta[i];
		for(j = 0; j< Theta[i].size()[0]; j++){
			temp_matrix._data[j][0] = 0;
		}
		Theta_grad[i] = math.add(Theta_grad[i],math.multiply((lambd/m),temp_matrix));
	}

	// Cost regularization
	J*=(1.0/m);
    var JR=0;
    for(i=0;i<Theta.length;i++){
        for(j=0;j<Theta[i].size()[0];j++){
		    for(k=0; k<Theta[i].size()[1];k++){
				    JR+=Theta[i]._data[j][k]*Theta[i]._data[j][k];
			}

		}
    }
	JR*=lambd/(2*m);

	J += JR;

	console.log("Cost J = ");
	console.log(J);

    return Theta_grad;

}

function train(nb_epochs,eta,Theta,layers,X,y,num_labels,lambd,early_stopping){

	var Theta_grad;
	for(e=0; e<nb_epochs;e++){
		console.log("Epoch number : ");
		console.log(e);
		Theta_grad = backwards2(Theta,layers,X,y,num_labels,lambd);
		for(l=0;l<Theta_grad.length;l++){
			Theta_grad[l] = math.multiply(Theta_grad[l],(-1)*eta);
			Theta[l] = math.add(Theta[l],Theta_grad[l]);
		}
	}
	return Theta;
}

function train_asynchrone(Theta,layers,minibatch_data,minibatch_labels,num_labels,lambd){

	var Theta_grad;
	Theta_grad = backwards2(Theta,layers,minibatch_data,minibatch_labels,num_labels,lambd);
	return Theta_grad;
}

function getRandomMinibatch(size_training) {
	var read = read_dataset(size_training, 0);
	var images_training = [];
	var labels_training= [];

	for(i=0;i<read[0].length;i++){
		images_training.push(read[0][i].input);
		labels_training.push(read[0][i].output);
	}

	var X = math.matrix(images_training);
	var Y = math.matrix(labels_training);

	return [X,Y]
}

function getAccuracy(weights) {
	var minibatch = getRandomMinibatch(100);
	var minibatch_data = minibatch[0];
	var minibatch_labels = minibatch[1];

	var pred  = predict(weights, minibatch_data);
	var accuracy = 0.0;

	for(var w = 0; w< minibatch_labels._data.length;w++){
		if(pred[w] == minibatch_labels._data[w].indexOf(1)){
			accuracy += 1.0;
		}
	}
	return accuracy;
}

function gradientFromWeights(weights) {
  var layers = []
  for(var i = 0; i < weights.length; i++) {
    layers.push(weights[i].data[0].length)
  }
  layers.push(weights[weights.length-1].data.length)

  var Theta = []
	for(var i = 0; i < weights.length; i++) {
		var M = math.matrix(weights[i].data);
		Theta.push(M)
	}
	console.log("Accuracy : "+getAccuracy(Theta));

	var minibatch = getRandomMinibatch(100);
	var minibatch_data = minibatch[0];
	var minibatch_labels = minibatch[1];
  var num_labels = layers[layers.length - 1];
  var lambd = 3.0; //set your regularization param
  var res = train_asynchrone(Theta,layers,minibatch_data,minibatch_labels,num_labels,lambd);

	for(i = 0 ; i<res.length; i++){
		for(k = 0; k<res[i].size()[0]; k++){
			for(l = 0; l<res[i].size()[1]; l++){
				res[i]._data[k][l] = Math.round(res[i]._data[k][l] * 100) / 100;
			}
		}
	}

  return res
}

function unroll_params(Theta){
	var nn_params = [];
    for(i = 0 ; i<Theta.length; i++){
		for(k = 0; k<Theta[i].size()[0]; k++){
			for(l = 0; l<Theta[i].size()[1]; l++){
				nn_params.push(Math.round(Theta[i]._data[k][l] * 100) / 100);
			}
		}
	}
	//console.log("unroll param");
	//console.log(nn_params);
    return nn_params;
}
