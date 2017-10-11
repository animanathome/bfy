var express = require('express');
var bodyParser = require('body-parser')
var http = require('http');
var lol = require('./lol.js')

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('port', 3001);

var server = http.createServer(app);
server.listen(app.get('port'), function (){
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

var socket = require('./socket.js');
var io = require('socket.io').listen(server);
io.sockets.on('connection', socket);

// requests
// app.get('/summoner', function(req, res){
// 	console.log('summoner get request', req.query)

// 	console.log('header', res.headers)

// 	lol.getSummonerByName(req.query.name)
// 	.then(function(data){
// 		console.log(data)
// 		res.json(data)
// 	})
// 	.catch(function(err){
// 		console.log(err)
// 		res.json({err:'failed request'})
// 	})
// })

module.exports = app;