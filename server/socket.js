var lol = require('./lol.js')

module.exports = function (socket) {
	
	socket.emit('init', {
		action: 'init'
	});

	socket.on('connect', function () {
		console.log('connect')
	});

	socket.on('disconnect', function () {
		console.log('disconnect')
	});

	socket.on('summoner:getByName', function(data){
		console.log('summoner::getByName', data)

		lol.getSummonerByName(data.name)
		.then(function(data){
			console.log(data)
			socket.emit('summoner:getByName', {
				data: data
			})
		})
		.catch(function(err){
			console.log(err)
			socket.emit('summoner:getByName', {
				error: err
			})
		})

	})
};