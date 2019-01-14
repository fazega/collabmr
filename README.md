# MapMine

MapMine allows training neural networks directly on the browsers of clients, in javascript.

People connected on youtube for instance could work on data they know nothing about. In this case youtube would just need to add this script line to its frontend :
```
<script src="http://api.mapmine.fr/mapmineclient.js/>
```

## Structure

MapMine has a backend and a frontend.

The frontend is the mapmineclient.js script. It is a javascript worker, doing its job on the computers of "infected" clients.
It performs the computation of the gradients of a given set of neurons and piece of data.

The backend give the data and network structure to the workers, gathers their results, and keep on giving work with updated neurons and new data. It is made in javascript too with NodeJS.

## Encryption

We added an option of homomorphic encryption to completely protect the data sent to the workers. The performance is however really bad, and the networks are very long to train.

## Host MapMine

To host a MapMine backend, you just need to clone the repo and do a simple npm start.

CAUTION. If you add MapMine to your website to use clients in order to train your networks, you need to warn them. You are not allowed use the power of their computers without asking them.


