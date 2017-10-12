var Q = require("q");

// evaluate
var match_data = require('./data/match_data'); // data from lolq.getMatches()
var champion_data = require('./data/champion_data'); // data from lolq.getChampions()
// console.log(champion_data.keys)

// var match_details = require('./data/match_2201358165');

var lol = require('./lolq')
var db = require('./loldb')

var filterPropertyValueMatch = function(data, property, propertyValue){
	var result = []
	for(var i = 0; i < data.length; i++){
		// console.log(data[i][property], '===', propertyValue)
		// console.log(typeof(data[i][property]), '===', typeof(propertyValue))
		if(data[i][property] === propertyValue){
			// console.log('----------------------------')
			// console.log(data[i])
			result.push(data[i])
		}
	}
	return result
}

var sortByPropertyValue = function(data, property){
	var result = {}
	for(var i = 0; i < data.length; i++){
		if(!result.hasOwnProperty(data[i][property])){
			result[data[i][property]] = [data[i]]
		}else{
			result[data[i][property]].push(data[i])
		}
	}
	return result
}

var getChampionName = function(champion_id){
	console.log('getChampionName', champion_id)
	return champion_data.keys[champion_id]
}

// extract and format data from a native LOL game scene
var extractDataFromMatchDetails = function(data, summoner_name){
	// console.log('extractDataFromMatchDetails')
	// console.log('\tname', summoner_name)

	// get participant id
	// NOTE: since the account or summoner id isn't always specified we're going to search by name
	// WARNING: since we search by name we might not find all entries (since the user might have changed their name)?
	var participant = null;
	data.participantIdentities.some(function(a){
		if(a.player.summonerName === summoner_name){
			participant = a;
		}
	})

	if(!participant){
		console.log("Unable to find participant with name", summoner_name)
		return
	}

	var info = null;
	data.participants.some(function(a){
		if(a.participantId === participant.participantId){
			info = a;
		}
	})

	if(!info){
		console.log("Unable to find info for participant with id", participant.participantId)
		return
	}

	// console.log(info)

	return {
		champion: getChampionName(info.championId),
		win: info.stats.win,
		kills: info.stats.kills,
		deaths: info.stats.deaths,
		assists: info.stats.assists,
		goldEarned: info.stats.goldEarned,
		goldSpent: info.stats.goldSpent,
		turretKills: info.stats.turretKills,
		doubleKills: info.stats.doubleKills,
		tripleKills: info.stats.tripleKills,
		quadraKills: info.stats.quadraKills,
		totalDamageDealt: info.stats.totalDamageDealt,
		totalDamageTaken: info.stats.totalDamageTaken,
		CS: info.stats.totalMinionsKilled + info.stats.wardsKilled
	}
}

var getSummonerByName = function(name){
	var deferred = Q.defer();

	// TODO: add local database query
	lol.getSummonerByName(name)
	.then(function(data){
		deferred.resolve(data);
	})
	.catch(function(err){
		deferred.reject(err);
	})

	return deferred.promise;
}

var getMatchDetails = function(game_id, user_name, region){
	console.log('getMatchDetails', game_id, user_name, region)
	var deferred = Q.defer();
	
	// query local database
	db.getMatchDetails(game_id)
	.then(function(data){
		// console.log('loldb', data)
		// return formated data to the user
		deferred.resolve(extractDataFromMatchDetails(data, user_name));
	})
	.fail(function(data){
	// query lol server

		// add timeout to avoid rate limiting
		setTimeout(function(){
			lol.getMatchDetails(game_id)
			.then(function(data){
				// console.log('lol', data)

				// add entry to db
				db.setMatchDetails(data)

				// return formated data to the user
				deferred.resolve(extractDataFromMatchDetails(data, user_name));
			})
			// TODO: add catch method
		}, 100)
	})

	return deferred.promise;
}

var getRecentMatches = function(account_id, user_name, region){
	console.log('getRecentMatchDetails')

	var deferred = Q.defer();

	lol.getRecentMatches(account_id)
	.then(function(data){

		var n_m = data.matches.length;
		var m = 0;
		var result = []


		var getData = function(){
			// console.log('requesting game', data.matches[m].gameId)
			getMatchDetails(data.matches[m].gameId, user_name, region)
			.then(function(game_details){
				result.push(game_details);

				m++;
				if(m < n_m){
					getData()
				}else{
					deferred.resolve(result);
				}
			})
		}

		getData();
	})

	return deferred.promise;
}

var lolAPI = (function(){
	return {
		getRecentMatches: getRecentMatches,
		getSummonerByName: getSummonerByName,
	}
})()

module.exports = lolAPI
