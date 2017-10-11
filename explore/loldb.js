var Q = require("q");
var MongoClient = require('mongodb').MongoClient;

var loldb = (function(){
	//  launch mongod --dbpath /Users/manu/Code/bfy/data/db
	
	this.db;
	this.matches;
	
	var url = 'mongodb://127.0.0.1:27017/bfy'
	var scope = this;

	MongoClient.connect(url, function(err, db) {
		console.log('connect')

		scope.db = db;
		scope.matches = db.collection('matches');
		scope.matches.count()
		.then(function(response){
			console.log(response, 'matches')
		})


		 scope.matches.findOne({'gameId':2585563902}, {'gameId':1})
		 .then(function(data){
		 	console.log('result', data)
		 })

		console.log('is connected ', db.serverConfig.isConnected())
		// console.log('matches', matches)
		// db.close();
		console.log('done')
	})

	var isConnected = function(){
		// console.log('isConnected')

		if(db !== undefined && db.serverConfig.isConnected()){
			if(matches !== undefined){
				return true;
			}else{
				return false;
				console.log('Unable to connect to matches collection.')		
			}
		}
		console.log('Unable to connect to database.', db)
		return false
	}

	var getMatchDetails = function(matchId){
		var deferred = Q.defer();

		// console.log('getMatchDetails', matchId)

		if(!isConnected()){
			setTimeout(function(){
				return deferred.reject();
			})
		}else{
			scope.matches.findOne({'gameId':matchId}, {})
			.then(function(response){
				if(response === null){
					deferred.reject();
				}else{
					deferred.resolve(response);
				}
			})
		}
		

		return deferred.promise;
	}

	var setMatchDetails = function(details){
		console.log('setMatchDetails', details)
		var deferred = Q.defer();

		if(!isConnected()){
			setTimeout(function(){
				return deferred.reject();
			})
		}else{
			scope.matches.insert(details)
		}

		return deferred.promise;
	}

	return {
		getMatchDetails: getMatchDetails,
		setMatchDetails: setMatchDetails 
	}
})()

module.exports = loldb