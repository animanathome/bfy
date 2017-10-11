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

// https://developer.riotgames.com/game-constants.html
// https://discussion.developer.riotgames.com/questions/1115/v3-season-id-constants.html
// 9 = SEASON2017
// 8 = PRESEASON2017
// 7 = SEASON2016
// 6 = PRESEASON2016
// 5 = SEASON2015
// 4 = PRESEASON2015
// 3 = SEASON2014
// 2 = PRESEASON2014
// 1 = SEASON3
// 0 = PRESEASON3
// console.log('season 7 ', filterPropertyValueMatch(match_data, 'season', 9).length)
// console.log('season 6 ', filterPropertyValueMatch(match_data, 'season', 7).length)
// console.log('season 5 ', filterPropertyValueMatch(match_data, 'season', 5).length)
// console.log('season 4 ', filterPropertyValueMatch(match_data, 'season', 3).length)
// console.log('season 3 ', filterPropertyValueMatch(match_data, 'season', 1).length)

// // get the champion ids
// var champion_ids = Object.keys(sorted_by_champion)
// // console.log(champion_data.keys)
// var champion_names = Object.keys(sorted_by_champion).map(function(id){
// 	console.log(id, champion_data.keys[id])
// 	return champion_data.keys[id]
// })
// console.log(champion_names.sort())

// console.log(match_details)

var getSummonerMatchDetails = function(data, summoner_name){
	// console.log('getSummonerMatchDetails')
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

	return {
		win: info.stats.win,
		kills: info.stats.kills,
		deaths: info.stats.deaths,
		assists: info.stats.assists,
		gold: info.stats.goldEarned - info.stats.goldSpent,
		turretKills: info.stats.turretKills,
		doubleKills: info.stats.doubleKills,
		tripleKills: info.stats.tripleKills,
		quadraKills: info.stats.quadraKills,
		totalDamageDealt: info.stats.totalDamageDealt,
		totalDamageTaken: info.stats.totalDamageTaken,
		CS: info.stats.totalMinionsKilled + info.stats.wardsKilled
	}
}

// // get the match details for the given champion 
// var getChampionMatchDetails = function(data, champion_id){
// 	console.log('getChampionMatchDetails')
// 	// console.log('\tchampion_id:', champion_id)
// 	console.log('\tdata:', data.participantIdentities)
// 	return

// 	// get participant id 

// 	// https://gaming.stackexchange.com/questions/32299/what-do-those-abbreviations-mean-in-league-of-legends
// 	var result = filterPropertyValueMatch(data.participants, 'championId', champion_id)
// 	if(result.length !== 1){
// 		// console.log('\tdata:', data.participants)
// 		throw new Error('Unable to find data for champion with id '+champion_id)
// 	}

// 	return {
// 		win: result[0].stats.win,
// 		kills: result[0].stats.kills,
// 		deaths: result[0].stats.deaths,
// 		assists: result[0].stats.assists,
// 		gold: result[0].stats.goldEarned - result[0].stats.goldSpent,
// 		turretKills: result[0].stats.turretKills,
// 		doubleKills: result[0].stats.doubleKills,
// 		tripleKills: result[0].stats.tripleKills,
// 		quadraKills: result[0].stats.quadraKills,
// 		totalDamageDealt: result[0].stats.totalDamageDealt,
// 		totalDamageTaken: result[0].stats.totalDamageTaken,
// 		CS: result[0].stats.totalMinionsKilled + result[0].stats.wardsKilled
// 	}
// }

// console.log(getChampionMatchDetails(match_details, 114))

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

var getMatchDetails = function(game_id){
	var deferred = Q.defer();
	
	// query local database
	db.getMatchDetails(game_id)
	.then(function(data){
		// console.log('loldb', data)
		deferred.resolve(data);
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

				deferred.resolve(data);
			})
			// TODO: add catch method
		}, 1200)
	})

	return deferred.promise;
}

var getChampionSeasonDetails = function(champion_games, summoner_name){
	// console.log('getChampionSeasonDetails', champion_games, champion_id)

	var deferred = Q.defer();
		
	var result = {};
	var i = 0;
	var games = champion_games.length;
	
	var getData = function(){
		getMatchDetails(champion_games[i].gameId)
		.then(function(data){
			
			var filtered_data = getSummonerMatchDetails(data, summoner_name);
			result[champion_games[i].gameId] = filtered_data;
			
			i++;

			if(i < games){
				getData();
			}else{
				deferred.resolve(result);
			}
		})
	}
	getData();

	return deferred.promise;
}

var getSeasonDetails = function(season_id){
	var deferred = Q.defer();

	if(season_id === undefined){
		season_id = 7
	}

	console.log('getSeasonDetails', season_id)

	// get the list of champions that were used during season #7
	var season_matches = filterPropertyValueMatch(match_data, 'season', season_id)

	// sort the matches based on their used champion
	var sorted_by_champion = sortByPropertyValue(season_matches, 'champion')

	var result = {};
	var i = 0;
	var champion_ids = Object.keys(sorted_by_champion);
	var n_champions = champion_ids.length;

	var getData = function(){
		var champion_id = champion_ids[i];
		// console.log('getData', champion_id);
		getChampionSeasonDetails(sorted_by_champion[champion_id], 'SerMeowington')
		.then(function(data){
			// console.log(data)
			result[champion_id] = data;

			i++
			if(i < n_champions){
				getData();
			}else{
				deferred.resolve(result);
			}
		})
	}
	getData();

	return deferred.promise;
}

var formatSeasonDetails = function(data){
	// champion_data.keys
	var details = {}
	var champion_ids = Object.keys(data);
	for(var i = 0; i < champion_ids.length; i++){
	// for(var i = 0; i < 5; i++){
		var entry = data[champion_ids[i]];
		var matches = Object.keys(entry);

		// console.log('-----')
		// console.log('name', champion_data.keys[champion_ids[i]]);
		// console.log('n matches', matches.length);
		// console.log('details', entry)

		var win = 0;
		var lose = 0;
		var kills = 0;
		var deaths = 0;
		var assists = 0
		var CS = 0;
		var turretKills = 0;
		var doubleKills = 0;
		var tripleKills = 0;
		var quadraKills = 0;
		var gold = 0;

		var maxKills = 0;
		var maxDeaths = 0;

		var totalDamageDealt = 0;
		var totalDamageTaken = 0;

		matches.map(function(item){
			entry[item].win === true ? win++ : lose++;
			maxKills = maxKills < entry[item].kills ? entry[item].kills : maxKills;
			maxDeaths = maxDeaths < entry[item].deaths ? entry[item].deaths : maxDeaths;

			kills += entry[item].kills;
			deaths += entry[item].deaths;
			assists += entry[item].assists;
			CS += entry[item].CS;
			turretKills += entry[item].turretKills;
			doubleKills += entry[item].doubleKills;
			tripleKills += entry[item].tripleKills;
			quadraKills += entry[item].quadraKills;
			totalDamageDealt += entry[item].totalDamageDealt;
			totalDamageTaken += entry[item].totalDamageTaken;
		})

		var result = {
			name: champion_data.keys[champion_ids[i]],
			played: matches.length,
			win: win,
			lose: lose,
			kills: kills/matches.length,
			deaths: deaths/matches.length,
			assists: assists/matches.length,
			CS: CS/matches.length,
			turretKills: turretKills/matches.length,
			doubleKills: doubleKills,
			tripleKills: tripleKills,
			quadraKills: quadraKills,
			maxKills: maxKills,
			maxDeaths: maxDeaths,
			totalDamageDealt: totalDamageDealt/matches.length,
			totalDamageTaken: totalDamageTaken/matches.length
		}
		// console.log(result)

		details[champion_ids[i]] = result;
	}
	// console.log(details)
	return details;
}

// console.log('champion', champion_data.keys[7])
// setTimeout(function(){
// 	getSeasonDetails(7)
// 	.then(function(data){
// 		// console.log('result', data)
// 		var result = {}
// 		result['season_7'] = formatSeasonDetails(data)
// 		console.log(JSON.stringify(result))		
// 	})
// }, 1000)

// getSeasonDetails()
// .then(function(data){
// 	console.log('result', data)
// })

// lol.getMatchDetails(2325874040)
// .then(function(data){
// 	// console.log('result', data)
// 	var result = getSummonerMatchDetails(data, 'SerMeowington')
// 	// console.log('result', result)
// })

// lol.getSummonerByName('testllkadkjf')
// .then(function(data){
// 	console.log(data)
// })
// .catch(function(err){
// 	console.log('failed', err)
// })

// seed data
// https://s3-us-west-1.amazonaws.com/riot-developer-portal/seed-data/matches1.json

// setTimeout(function(){
// 	getMatchDetails(2325874040)
// 	.then(function(data){
// 		console.log('got data back')
// 	})
// }, 1000)

var lolAPI = (function(){
	return {
		getSummonerByName: getSummonerByName,
		getMatchDetails: getMatchDetails
	}
})()

module.exports = lolAPI
