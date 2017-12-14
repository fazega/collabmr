function costFunction(nn_weights, layers, X, y, num_labels, lambd){
	var m = X.size()[0];
    var num_layers = layers.length;
    var Theta = roll_params(nn_weights, layers);
    var J = 0;
   
    var yv = math.zeros(num_labels, m);
    for(i=0; i<y.length;i++){
	    yv._data[y[i]][i]=1;
	}    
    
  
    // In this point calculate the cost of the neural network (feedforward)
    for(i=0;i<m;i++){
		
	    var h=X._data[i];

        for(j=0;j<num_layers-1;j++){
		    h=sigmoid(math.multiply(Theta[j],math.matrix([1].concat(h))));
		}
        for(k=0;k<num_labels;k++){ 
            J += (-1)*yv._data[k][i]*math.log(h._data[k])-(1-yv._data[k][i])*math.log(1-h._data[k]);
		}
	}
    
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
	
    return J;
}

function computeNumericalGradient(theta, layers, X, y, num_labels, l){
    var numgrad = math.zeros(theta.size());
    var perturb = math.zeros(theta.size());
    var e = 0.0001;

    for(i = 0; i<theta.length; i++){
        perturb[i]  = e;
        var loss1 = costFunction(theta - perturb,layers, X, y, num_labels, l);
        var loss2 = costFunction(theta + perturb,layers, X, y, num_labels, l);

        // Compute Numerical Gradient
        numgrad[i] = (loss2 - loss1) / (2*e);
        perturb[i] = 0.0;
	}
    return numgrad;


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
				nn_params.push(Theta[i]._data[k][l]);
			}
		}
	}
	//console.log("unroll param");
	//console.log(nn_params);
    return nn_params;
}

function backwards(nn_weights, layers, X, y, num_labels, lambd){
    var m = X.size()[0];
    var num_layers = layers.length;
    var Theta = roll_params(nn_weights, layers);
	var Theta_grad = [];
	for(i=0;i<Theta.length;i++){
		Theta_grad.push(math.zeros(Theta[i].size()));
	}
    var yv = math.zeros(num_labels, m);
    for(i=0; i<y.length;i++){
	    yv._data[y[i]][i]=1;
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
        
        var D = [];
		temp = [];
		for(k=0; k<num_labels;k++){
			temp.push(A[A.length-1][k]-yv._data[k][i]);
		}
        D.push(temp);
        var j=num_layers-2;
        while(j>0){
			var temp1 = math.subset(Theta[j],math.index(math.range(0,Theta[j].size()[0]),math.range(1,Theta[j].size()[1])));
			//console.log("taille temp1 :");
			//console.log(temp1);
		    var tempList = math.multiply(math.transpose(temp1),math.matrix(D[0]));
			//console.log("taille tempList :");
			//console.log(tempList);
			var sig =sigmoidGradient(Z[j])._data;
			//console.log("taille sig :");
			//console.log(sig);
			for(k=0; k<tempList.size()[0];k++){
				tempList._data[k] *= sig[k];
			}
			D=[tempList._data].concat(D);
			j--;
		}
		//console.log("D :");
		//console.log(D);

		
        for(l=0;l<Theta_grad.length;l++){
			for(n =0; n<D[l].length;n++){
				D[l][n]*=1.0/m;
			}
			var  temp1 =math.transpose(math.matrix([D[l]]));
			//console.log("Temp1 :");
			//console.log(temp1);
			var temp2 =math.matrix([[1].concat(A[l])]);
			//console.log("Temp 2 :");
			//console.log(temp2);
			var temp3 = math.multiply(temp1,temp2);
			//console.log("Theta_grad[l], temp3 :");
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
    
    //Unroll Params
    Theta_grad = unroll_params(Theta_grad);

    return Theta_grad;

}

function debugInitializeWeights(fan_out, fan_in){
	var len = fan_out*(1 + fan_in);
    var W = math.zeros(len);
	for(i=0;i<len;i++){
		W._data[i]=(math.sin(i)+1.0)/10.;
	}
    W = math.reshape(W,[fan_out,(1 + fan_in)] ); 
    return W
}

function checkNNCost(lambd){

    var input_layer_size  = 3;
    var hidden_layer_size = 5;
    var num_labels = 3;
    var m          = 5;
    var layers     = [3, 5, 3];
    
    var Theta = [];
    Theta.push(debugInitializeWeights(hidden_layer_size, input_layer_size));
    Theta.push(debugInitializeWeights(num_labels, hidden_layer_size));
    var nn_params = unroll_params(Theta);
    
    var X = debugInitializeWeights(m, input_layer_size - 1);
	var y =[];
	for(i=1;i<=m;i++){
		y.push(i%num_labels);
	}
    var cost = costFunction(nn_params, layers, X, y, num_labels, lambd);
    console.log('Cost: ' + cost);

}

function computeNumericalGradient(theta, layers, X, y, num_labels, l){
    var numgrad = math.zeros(theta.length);
    var perturb = math.zeros(theta.length);
    var e = 0.0001;

    for(i=0;i<theta.size;i++){
        perturb._data[i]  = e;
        var loss1 = costFunction(theta - perturb,layers, X, y, num_labels, l);
        var loss2 = costFunction(theta + perturb,layers, X, y, num_labels, l);
        //Compute Numerical Gradient
        numgrad._data[i] = (loss2 - loss1) / (2*e);
        perturb._data[i] = 0.0;
	}
    return numgrad;
}
function checkNNGradients(lambd){

    var input_layer_size  = 3;
    var hidden_layer_size = 5;
    var num_labels = 3;
    var m          = 5;
    var layers     = [3, 5, 3];
    
    var Theta = [];
    Theta.push(debugInitializeWeights(hidden_layer_size, input_layer_size));
    Theta.push(debugInitializeWeights(num_labels, hidden_layer_size));
	//console.log("debug Theta");
	//console.log(Theta);
	var nn_params = unroll_params(Theta);
    
    var X = debugInitializeWeights(m, input_layer_size - 1);
	
	var y =[];
	for(i=1;i<=m;i++){
		y.push(i%num_labels);
	}
    // Compute Numerical Gradient
    var numgrad = computeNumericalGradient(nn_params,layers, X, y, num_labels, lambd);
    // Compute Analytical Gradient (BackPropagation)
    var truegrad = backwards(nn_params, layers, X, y, num_labels, lambd);
	//console.log(truegrad);
    
	//console.log([numgrad,truegrad]);
    //console.log("The above two rows must be very similar.\n(Left-Numerical Gradient, Right-Analytical Gradient (BackPropagation)\n")
   // var diff = linalg.norm(numgrad - truegrad) / linalg.norm(numgrad + truegrad);
	
 //   console.log("\nNote: If the implementation of the backpropagation is correct, the relative different must be quite small (less that 1e-09).");
    var diff =0;
	//console.log("Relative difference: " + diff + "\n");
}

function test(){
		console.log("\nEvaluating sigmoid function ...\n");

		var g = sigmoid(math.matrix([1, -0.5, 0,  0.5, 1]));
		console.log("Sigmoid evaluated at [1 -0.5 0 0.5 1]:  ");
		console.log(g);


		console.log("\nEvaluating Sigmoid Gradient function ...\n");
		g = sigmoidGradient(math.matrix([1, -0.5, 0,  0.5, 1]));
		console.log("Sigmoid Gradient evaluated at [1 -0.5 0 0.5 1]:  ");
		console.log(g);

		console.log("\nChecking Cost Function without Regularization (Feedforward) ...\n");

		var lambd = 0.0;
		checkNNCost(lambd);

		console.log('This value should be about 2.09680198349');


		console.log("\nChecking Cost Function with Reguralization ... \n");

		lambd = 3.0;
		checkNNCost(lambd)

		console.log('This value should be about 2.1433733821');

		console.log("\nChecking Backpropagation without Regularization ...\n");

		lambd = 0.0;

		checkNNGradients(lambd);

		console.log("\nChecking Backpropagation with Regularization ...\n");

		lambd = 3.0;
		checkNNGradients(lambd);

}