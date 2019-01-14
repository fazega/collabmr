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

The backend give the data and network structure to the workers, gathers their results, and keep on giving work with updated neurons and new data.


## Encryption


## Host MapMine


