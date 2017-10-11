// query
var credentials = require('./credentials');
var fs = require('fs')
var jsonfile = require('jsonfile')
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var Q = require("q");

// var username ='RiotSchmick'
var username = 'SerMeowington'

// KDA = (kills + assists) / deaths


// get summoner by name
// returns 
// { id: 53300045,
//   accountId: 215942119,
//   name: 'SerMeowington',
//   profileIconId: 949,
//   revisionDate: 1507503461000,
//   summonerLevel: 30 }
// var query = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'
// query += username + '?api_key='
// query += credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })

// -- champion masteries --

// get champion masteries by summoner-id
// returns
// [ { playerId: 585897,
//     championId: 1,
//     championLevel: 6,
//     championPoints: 147896,
//     lastPlayTime: 1507436172000,
//     championPointsSinceLastLevel: 126296,
//     championPointsUntilNextLevel: 0,
//     chestGranted: true,
//     tokensEarned: 1 },
//   { playerId: 585897,
//     championId: 42,
//     championLevel: 1,
//     championPoints: 104,
//     lastPlayTime: 1494132280000,
//     championPointsSinceLastLevel: 104,
//     championPointsUntilNextLevel: 1696,
//     chestGranted: false,
//     tokensEarned: 0 } ]
// var summoner_id = 585897
// var query = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/'
// query += summoner_id 
// query += '?api_key='
// query += credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })

// get champion masteries scores by summoner-id
// returns
// 203
// var summoner_id = 585897
// var query = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/scores/by-summoner/'
// query += summoner_id 
// query += '?api_key='
// query += credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })

//	get champion mastery by player id and champion id
// { playerId: 585897,
//   championId: 23,
//   championLevel: 1,
//   championPoints: 154,
//   lastPlayTime: 1500960868000,
//   championPointsSinceLastLevel: 154,
//   championPointsUntilNextLevel: 1646,
//   chestGranted: false,
//   tokensEarned: 0 }
// var summonerId = 585897
// var championId = 23
// var query = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries'
// query += '/by-summoner/' + summonerId
// query += '/by-champion/' + championId
// query += '?api_key=' + credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })


// -- champions --

// var freeToPlay = true;
// var query = 'https://na1.api.riotgames.com/lol/platform/v3/champions?'
// query +='freeToPlay='+freeToPlay
// query += '&api_key=' + credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })

// retrieves champion list
// var locale = 'en_US'
// var tags= 'all'
// var dataById = false;
// var query = 'https://na1.api.riotgames.com/lol/static-data/v3/champions'
// query += '?locale='+locale
// query += '&tags='+tags
// query += '&dataById='+dataById
// query += '&api_key='+credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })

var getChampions = function(){
	var deferred = Q.defer();

	var locale = 'en_US'
	var tags= 'all'
	var dataById = false;
	var query = 'https://na1.api.riotgames.com/lol/static-data/v3/champions'
	query += '?locale='+locale
	query += '&tags='+tags
	query += '&dataById='+dataById
	query += '&api_key='+credentials.riot.key
	rp({uri: query,json:true})
	.then(function(response){
		deferred.resolve(response);
	})
	return deferred.promise;
}

// getChampions()
// .then(function(data){
// 	jsonfile.writeFile('champions_data.json', data, function(){
// 		console.log('done writing data')
// 	})
// })

// images (profile icons)
// http://ddragon.leagueoflegends.com/cdn/7.5.2/img/champion/Warwick.png
// http://ddragon.leagueoflegends.com/cdn/7.5.2/img/sprite/champion4.png
// var query = 'https://na1.api.riotgames.com/lol/static-data/v3/profile-icons?locale=en_US'
// query += '&api_key='+credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })


// -- matches -- 
// here we only get a result when setting season to 9?
// WARNING: the season parameter doesn't seem to return the proper result
// we can only get all of the results when stepping through all of the slices
// WARNING: not that here the init totalGames number is not correct
// var accountId = 215942119
// var season = 4
// var beginIndex = 0
// var query = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/'
// query +='by-account/'+accountId
// // query += '?season='+season
// query += '&beginIndex='+beginIndex
// query += '&api_key='+credentials.riot.key
// console.log(query)
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })

// get all the matches from accountId
var getMatches = function(accountId){
	// NOTE: the season parameter doesn't not to work. Therefore we're fetching all the match data.
	if(accountId === undefined){
		accountId = 215942119
	}
	
	var deferred = Q.defer();
	var beginIndex = 0;
	var matches = [];
	
	var fetch = function(){
		var query = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/'
		query +='by-account/'+accountId
		query += '?beginIndex='+beginIndex
		query += '&api_key='+credentials.riot.key
		console.log(query)
		rp({
			uri: 
			query,json:true
		})
		.then(function(response){
			console.log(response)

			if(response.matches.length > 0){
				for(var i = 0; i < response.matches.length; i++){
					matches.push(response.matches[i]);
				}
			}

			if(beginIndex < response.endIndex){
				beginIndex = response.endIndex;
				fetch();
			}else{
				console.log('done')
				console.log(matches.length)
				deferred.resolve(matches);
			}

		})
	}
	fetch();
	
	return deferred.promise;
}

// getMatches()
// .then(function(data){
// 	jsonfile.writeFile('match_data.json', data, function(){
// 		console.log('done writing data')
// 	})
// })
var getMatchDetails = function(matchId){
	if(matchId === undefined){
		matchId = 2201358165
	}
	var deferred = Q.defer();
	
	var query = 'https://na1.api.riotgames.com/lol/match/v3/'
	query +='matches/'+matchId
	query += '?api_key='+credentials.riot.key
	console.log(query)
	rp({uri: query,json:true})
	.then(function(response){
		deferred.resolve(response);
	})
	return deferred.promise;
}

// var matchId = 2201358165
// getMatchDetails(matchId)
// .then(function(data){
// 	jsonfile.writeFile('./data/match_'+matchId+'.json', data, function(){
// 		console.log('done writing data to', './data/match_'+matchId+'.json')
// 	})
// })

// League of legend server queries

var lol = (function(){

	var getURL = function(region){
		if(region === undefined){
			region = 'na1'
		}

		var query = 'https://'+region+'.api.riotgames.com/lol/';
		
		return query;
	}

	// get summoner by name
// returns 
// { id: 53300045,
//   accountId: 215942119,
//   name: 'SerMeowington',
//   profileIconId: 949,
//   revisionDate: 1507503461000,
//   summonerLevel: 30 }
// var query = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'
// query += username + '?api_key='
// query += credentials.riot.key
// rp({uri: query,json:true})
// .then(function(response){
// 	console.log(response)
// })
	var getSummonerByName = function(name, region){
		if(name === undefined){
			name = 'SerMeowington'
		}
		var deferred = Q.defer();
		console.log('getSummonerByName', name, region)

		var query = getURL(region)
		query += 'summoner/v3/summoners/by-name/'+name
		query += '?api_key='+credentials.riot.key
		rp({uri: query,json:true})
		.then(function(response){
			deferred.resolve(response);
		})
		.catch(function(err){
			deferred.reject({
				statusCode:err.statusCode, 
				message: err.message
			})
		})
		return deferred.promise;
	}

	var getMatchDetails = function(matchId, region){
		if(matchId === undefined){
			matchId = 2201358165
		}
		
		var deferred = Q.defer();
		
		// console.log('getMatchDetails', matchId, region)
		var query = getURL(region)
		query +='match/v3/matches/'+matchId
		query += '?api_key='+credentials.riot.key
		console.log(query)
		rp({uri: query,json:true})
		.then(function(response){
			// console.log('response', response)
			deferred.resolve(response);
		})
		.catch(function(err){
			deferred.reject(err.message)
		})

		return deferred.promise;
	}

	return {
		getSummonerByName: getSummonerByName,
		getMatchDetails: getMatchDetails
	}
})()

module.exports = lol


