// query LOL servers (slower)

var credentials = require('./credentials');
var fs = require('fs')
var jsonfile = require('jsonfile')
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var Q = require("q");

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

var lol = (function(){

	var getURL = function(region){
		if(region === undefined){
			region = 'na1'
		}

		var query = 'https://'+region+'.api.riotgames.com/lol/';
		
		return query;
	}

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

	var getRecentMatches = function(accountId, region){
		if(accountId === undefined){
			accountId = 237242134
		}

		var deferred = Q.defer();
		
		// console.log('getRecentMatches', accountId, region)
		var query = getURL(region)
		query +='match/v3/matchlists/by-account/'+accountId+'/recent'
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

	var getMatchDetails = function(matchId, region){
		if(matchId === undefined){
			matchId = 2201358165
		}
		
		var deferred = Q.defer();
		
		// console.log('getMatchDetails', matchId, region)
		var query = getURL(region)
		query +='match/v3/matches/'+matchId
		query += '?api_key='+credentials.riot.key
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
		getRecentMatches: getRecentMatches,
		getSummonerByName: getSummonerByName,
		getMatchDetails: getMatchDetails
	}
})()

module.exports = lol
