var aBound = 10;
var tBound = 10;
var eBound = 10;

function encryptedVector(a) {
	if(a!=undefined){
		this.enc = [];
		for(let i = 0; i< a._data.length; i++){
			this.enc.push(new encryptedNb(math.matrix([a._data[i]])));
		}
		this.enc = math.matrix(this.enc);
	}
	else{
		this.enc = [];
	}
    this.add = function (b){
		var res = new encryptedVector();
		for(let i = 0; i < this.enc._data.length; i++){
			res.enc.push(this.get(i).add(b.get(i)));
		}
		res.enc = math.matrix(res.enc);
		return res;
	}
	this.sig = function(){
		return 0;
	}
	this.inProd = function (clear){
		var res = new encryptedNb();
		for(let i = 0; i < this.enc._data.length; i++){
			res = res.add(this.get(i).times(clear[i]));
		}
		res.enc = math.matrix(res.enc);
		return res;
	}
	this.times = function (scal){
		var res = new encryptedVector();
		for(let i = 0; i < this.enc._data.length; i++){
			res.enc.push(this.get(i).times(scal));
		}
		res.enc = math.matrix(res.enc);
		return res
	}
	this.get = function(i){
		return this.enc._data[i];
	}
}

function decrypt_vec(vec){
	res = [];
	for(var i=0; i<vec.enc._data.length;i++){
		res.push(math.round(s_decrypt(vec.get(i).enc))[0]/scaling_factor);
	}
	res = math.matrix(res);
	return res;
}

function innerProd(c1, c2, M,l){
    var cc1 = math.matrix(math.zeros(math.size(c1)._data[0],1));
    for(var i=0; i<math.size(c1)._data[0];i++){
        cc1._data[i][0] = c1._data[i];
    }
    var cc2 = math.matrix(math.zeros(1,math.size(c2)._data[0]));
    for(var i=0;i<math.size(c2)._data[0];i++){
        cc2._data[0][i] = c2._data[i];
    }
    var cc = vectorize(math.multiply(cc1,cc2));
    var bv = getBitVector(math.round(math.multiply(cc,1/w)),l);

    return math.multiply(M,bv);
}
function vectorize(M){
	var ans =math.zeros(math.size(M)._data[0] * math.size(M)._data[1],1);
    for(var i=0; i<math.size(M)._data[0];i++){
        for(var j=0;j<math.size(M)._data[1];j++){
            ans._data[i*math.size(M)._data[0] + j][0] = M._data[i][j];
		}
	}
	return ans;
}
function int2bin(x){
    var s = []
    var mod = 2;
    while(x > 0){
        s.push(x % 2);
        x = Math.trunc(x / 2);
    }
	return math.matrix(s.reverse());
}

function getBitVector(c,l){
    var m = math.size(c)._data[0];
    var c_star = math.zeros(l * m);
    for(var i=0; i<m;i++){
        var local_c = math.round(c._data[i]);
        if(local_c < 0){
            local_c = -local_c;
        }
		var b = int2bin(local_c);
        if(c._data[i] < 0){
            b *= -1;
		}
        if(c._data[i] == 0){
            b *= 0;
		}

		// c_star[(i * l) + (l-len(b)): (i+1) * l] += b
		var q = 0;
		var longu = math.size(b)._data[0];
		for(var k=((i * l) + (l-longu)); k<((i+1)*l);k++){
			c_star._data[k] = c_star._data[k] + b._data[q];
			q = q + 1;
		}
	}
    return c_star;
}
function encrypt(T, x,w,l){
    return keySwitch(keySwitchMatrix(math.eye(math.size(x)),T,l), math.multiply(w,x),l);
}

function one_way_encrypt_vector(vector,scaling_factor){
    var padded_vector = math.random([math.size(vector)._data[0]+1]);
	padded_vector = math.matrix(padded_vector);
    for(var j=0;j<math.size(vector)._data[0];j++){
		padded_vector._data[j]=vector._data[j];
	}
    var vec_len = math.size(padded_vector)._data[0];
	var res1 = math.multiply(padded_vector,scaling_factor/ (vec_len-1));

    //var M_temp = math.multiply(M_keys[vec_len-2],(padded_vector[i]*scaling_factor )/ (vec_len-1));
	var Mtmp = math.zeros(math.size(M_keys[vec_len-2]));//math.multiply(M_keys[vec_len-2],(padded_vector._data[i]*scaling_factor )/ (vec_len-1));
	for(var k=0;k<Mtmp._data.length;k++){
		Mtmp._data[k] = math.multiply(math.matrix(M_keys[vec_len-2]._data[k]),(padded_vector._data[k]*scaling_factor/(vec_len-1)))._data;
	}
    var e_vector = innerProd(math.matrix(c_ones[vec_len-2]),math.matrix(c_ones[vec_len-2]),Mtmp,l);
    return e_vector;
}

function s_decrypt(vec){
    return decrypt(getSecretKey(T_keys[vec._data.length-2]),vec,w);
}
function keySwitch(M,c,l){
    var c_star = getBitVector(c,l);
    return math.multiply(M,c_star);
}

function getRandomMatrix(row,col,bound){
    var A = math.zeros(row,col);
    for(var i=0; i<row; i++){
        for(var j=0; j<col; j++){
            A._data[i][j] = math.randomInt(bound);
		}
	}
	return A;

}

// TODO
function getBitMatrix(S,l){
    var S_star = [];
    for(var i=0; i<l; i++){
        S_star.push(math.multiply(math.matrix(S),math.pow(2,(l-i-1))));
    }
	// TODO
	// S_star = np.array(S_star).transpose(1,2,0).reshape(len(S),len(S[0])*l);
	var N = math.size(S)._data[0];
	var M = math.size(S)._data[1];
	var S_bis = [];
	for(var n = 0; n<N; n++){
		var x = [];
		for(var m = 0; m<M; m++){
			for(var k = 0; k<l; k++){
				x.push(S_star[k]._data[n][m])
			}
		}
		S_bis.push(x);
	}
	S_star = math.matrix(S_bis);
    return S_star;
}

function getSecretKey(T){
    //assert(T.ndim == 2)
    var I = math.eye(T._data.length); //num rows
    return hCat(I,T);
}

function hCat(A,B){
    return math.concat(A,B,1);
}

function vCat(A,B){
    return math.concat(A,B,0);
}

function keySwitchMatrix(S, T,l){
    var S_star = getBitMatrix(S,l);
    var A = getRandomMatrix(math.size(math.matrix(T))._data[1],math.size(S_star)._data[1], aBound);
    var E = getRandomMatrix(math.size(S_star)._data[0], math.size(S_star)._data[1], eBound);
	// return vCat(S_star + E - T.dot(A), A)
	var res1 = math.add(S_star, E);
	var res2 = math.multiply(T,A);
	var res3 = math.multiply(-1,res2);
	var res = math.add(res1,res3);
    return vCat(res, A);
}

function decrypt(S, c,w){
    var Sc = math.multiply(S,c);
    return math.round(math.multiply(Sc, 1/w)._data);
}

function innerProdClient(T,l){
    var S = getSecretKey(T);
    var tvsts = math.transpose(vectorize(math.multiply(math.transpose(S),S)));
    var mvsts = copyRows(tvsts, T._data.length);
    return keySwitchMatrix(mvsts,T,l);
}
function copyRows(row, numrows){
	var ans = math.zeros(numrows, math.size(row)._data[1]);
    for(var i=0; i<numrows;i++){
        for(var j=0; j<math.size(row)._data[1];j++){
            ans._data[i][j] = row._data[0][j];
		}
    }
    return ans;
}

function transpose(syn1){

    var rows = syn1.length;
    var cols = syn1._data[0].length - 1;

    var max_rc = math.max(rows,cols);

    var syn1_c = [];
    for(var i=0; i<syn1.length;i++){
        var tmp = math.zeros(max_rc+1);
		for(var j=0;j<syn1._data[i].length;j++){
			tmp._data[j] = syn1._data[i][j];
		}
        syn1_c.push(tmp);
    }
    var syn1_c_transposed = [];

    for(var row_i=0; row_i<cols; row_i++){
        var syn1t_column = innerProd(syn1_c._data[0],v_onehot._data[max_rc-1][row_i],M_onehot._data[max_rc-1][0],l) / scaling_factor;
        for(var col_i=0; col_i<(rows-1); col_i++){
            var syn1t_column = math.add(syn1t_column,innerProd(syn1_c._data[col_i+1],v_onehot._data[max_rc-1][row_i],M_onehot._data[max_rc-1][col_i+1],l) / scaling_factor);
			}
        syn1_c_transposed.push(syn1t_column.subset(0,rows+1));
    }
    return syn1_c_transposed;
}

// HAPPENS ON SECURE SERVER

var l = 100;
var w = math.pow(2,17);
var max_dim = 16;
var scaling_factor = 10000;

// keys
var T_keys = [];
for(var i=0; i<max_dim; i++){
    T_keys.push(math.matrix(math.random([i+1,1])));
}

// one way encryption transformation
var M_keys = [];
for(var i=0; i<max_dim;i++){
    M_keys.push(innerProdClient(T_keys[i],l));
}

var c_ones = [];
for(var i=0;i<max_dim;i++){
    c_ones.push(encrypt(T_keys[i],math.ones(i+1), w, l));
}


//test

function puis(c,n){
    var res=c;
    for(var i=1; i<n;i++){
        res = math.multiply(innerProd(c,res,M_keys[0],l),1/scaling_factor);
    }
	return res;
}

function sig_grad(c){
    return sig(c)*(1-sig(c));
}

function sig_vector(vec){
    var res = math.zeros(math.size(vec)._data[0]);
    for(var i=0;i<math.size(vec)._data[0];i++){
        res._data[i] = sig(vec._data[i]);
	}
    return res;
}

/*
function mult(c1,c2){
	return math.multiply(innerProd(c1,c2,M_keys[0],l),1/scaling_factor);
}
*/


function encryptedNb(x) {
	if(x==undefined){
		this.enc = math.zeros(2);
	}
	else{
		this.enc = one_way_encrypt_vector(x,scaling_factor);
	}
    this.add = function (vec){
		var res = new encryptedNb();
		for(let i = 0; i < 2; i++){
			res.enc._data[i] = this.enc._data[i] + vec.enc._data[i];
		}
		return res;
	}
	this.multiply = function (vec){
		var res = new encryptedNb();
		res.enc = math.multiply(innerProd(this.enc,vec.enc,M_keys[0],l),1/scaling_factor);
		return res;
	}
	this.times = function (scal){
		var res = new encryptedNb();
		for(let i = 0; i < 2; i++){
			res.enc._data[i] = this.enc._data[i]*scal;
		}
		return res;
	}
}


function matrixMult(A,vec){
	// clear A
	var res = new encryptedVector();
	for(var i=0;i<vec.enc._data.length;i++){
		res.enc.push(vec.inProd(A._data[i]));
	}
	res.enc = math.matrix(res.enc);
	return res;
}
/*var x = math.matrix([1.5,2]);
var y = math.matrix([5,6]);
var m = x._data.length;
var T = T_keys[math.size(x)._data[0]-1];*/

/*
var n = m;
var c = one_way_encrypt_vector(y,scaling_factor);
var c_2 = one_way_encrypt_vector(x,scaling_factor);
var c_3 = one_way_encrypt_vector(y,scaling_factor);
console.log(c);
console.log(c_2);
*/
