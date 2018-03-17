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

// predict n'est utilisee que par le serveur, qui peut donc encrypter et decrypter a sa guise
// X est un array d'encryptedVector (les encryptions de chaque exemple)
function predict(ThetaRes, X){
    var m = X.size()[0];
    var num_labels = ThetaRes[ThetaRes.length-1].size()[0];
    var num_layers = ThetaRes.length + 1;
    var p = [];

    for(k=0;k<m;k++){
		// h est un encryptedVector
        var h = X._data[k];
        for(index=0;index<(num_layers-1);index++){
			h.enc = math.concat(new encryptedVector(math.matrix([1])).enc,h.enc);
			h = matrixMult(ThetaRes[index],h).sigmoid();
		}
		var act = decrypt_vec(h)
		var max = math.max(act);

		for(j=0; j<h.size()[0];j++){
			if(act._data[j] == max){
				p.push(j);
			}
		}
	}
	return p;
}

// fonction appelée par le serveur au tout début
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
    return nn_params;
}

// X est un array d'encryptedVector, y aussi (les encryptions de chaque exemple et de chaque label)
function backwards2(Theta, layers, X, y, num_labels, lambd){
    var m = X.size()[0];
    var num_layers = layers.length;
	var Theta_grad = [];
	var J = 0;

    // In this point implement the backpropagation algorithm
    for(i=0;i<m;i++){
		// A et Z sont des listes d'encryptedVector (pre-activations et activations)
	    A = [];
        Z = [];
        A.push(X._data[i]);
        Z.push(new encryptedVector(math.matrix([0])));
        for(j=0;j<num_layers-1;j++){
			var h = new encryptedVector(math.matrix([1]));
			h.enc = math.matrix(h.enc._data.concat(A[j].enc._data));
			Z.push(matrixMult(Theta[j],h));
            A.push(Z[j+1].sigmoid());
		}

		// Cost computation for each training example (without regularization)
		/*
		for(k=0;k<num_labels;k++){
            J += (-1)*y._data[i][k]*math.log(A[A.length-1][k])-(1-y._data[i][k])*math.log(1-A[A.length-1][k]);
		}
		*/

        var D = [];
		temp = [];
		for(k=0; k<num_labels;k++){
			temp.push(A[A.length-1].get(k).add(y._data[i].get(k).times(-1)));
		}
        D.push(temp);
        var j=num_layers-2;
        while(j>0){
			var temp1 = math.subset(Theta[j],math.index(math.range(0,Theta[j].size()[0]),math.range(1,Theta[j].size()[1])));
			var tempList = matrixMult(math.transpose(temp1),D[0]);
			var sig = Z[j].sigmoid_grad();
			tempList = tempList.multiply(sig);
			D=[tempList].concat(D);
			j--;
		}

        for(l=0;l<Theta_grad.length;l++){
			D[l] = D[l].times(1.0/n);
			A[l].enc = math.concat(new encryptedVector(math.matrix([1])),A[l].enc);
			var resT = [];
			// resT est une liste de lignes qui sont des encryptedVec (equivalent d'une encryptedMatrix)
			for(var j = 0; j < A[l].enc._data.length; j++){
				resT.push(D[l].timesEnc(A[l].get(j)));
			}
			Theta_grad.push(resT);
		}

	}

    //regularization : faite en cryptant les poids, puis add avec theta_grad deja crypte
    for(var i = 0; i<num_layers - 1; i++){
		var temp_matrix = Theta[i];
		for(var j = 0; j< Theta[i].size()[0]; j++){
			temp_matrix._data[j][0] = 0;
		}
		for(var k = 0; k < Theta_grad[i].length; k++){
			Theta_grad[i][k] = Theta_grad[i][k].add(new encryptedVector(math.matrix(temp_matrix._data[k])).times(lambd/m));
		}
	}

	/*
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
	*/

    return [Theta_grad, J];

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

	var Theta_grad, cost;
	var b = backwards2(Theta,layers,minibatch_data,minibatch_labels,num_labels,lambd);
	Theta_grad = b[0];
	cost = b[1];
	return [Theta_grad, cost];
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

/*function getAccuracy(weights,data) {
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
}*/

function gradientFromWeights(weights, data) {
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

  var size_out = layers[layers.length-1]
  console.log(data);
	var inputs = data.map((x)=>{let v = new encryptedVector();v.enc = math.matrix(x.enc._data.slice(0,x.enc._data.length-size_out));return v;});
  var outputs = data.map((x)=>{let v = new encryptedVector();v.enc = math.matrix(x.enc._data.slice(x.enc._data.length-size_out,x.enc._data.length));return v;});
  console.log(inputs)
  console.log(outputs)
  var lambd = 3.0; //set your regularization param
  var res = train_asynchrone(Theta,layers,math.matrix(inputs),math.matrix(outputs),size_out,lambd);

	var grad = res[0];
	var cost = res[1];

	for(i = 0 ; i<grad.length; i++){
		for(k = 0; k<grad[i].size()[0]; k++){
			for(l = 0; l<grad[i].size()[1]; l++){
				grad[i]._data[k][l] = Math.round(grad[i]._data[k][l] * 100) / 100;
			}
		}
	}

  return [grad, cost]
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
