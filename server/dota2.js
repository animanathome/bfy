// https://github.com/mbax/yasp
var APIKEY="494EDA5106EEEEBC4D9257A7515C51BB"

var fs = require('fs')
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var Q = require("q");

var steam32to64 = function(steamid32){
	return steamid32 + 76561197960265728;
}

var steam64to32 = function(steamid64){
	return steamid64 - 76561197960265728;
}

var dateToInt = function(dateStr){
	return new Date(dateStr).getTime()
}

var addDays = function(dateStr, daysToAdd){
	if(daysToAdd === undefined){
		daysToAdd = 1
	}
	return new Date(new Date(dateStr).getTime() + daysToAdd * 24 * 60 * 60 * 1000)
}

// convert unix time stamp to Date object
var unixTimeStampToDate = function(dateStr){
	return new Date(dateStr*1000)
}

// convert Date object to unix time stamp
var dateToUnixTimeStamp = function(date){
	return parseInt(new Date(date).getTime()/1000)
}

// console.log("date as int", dateToInt("2000-01-01T00:00"))
// console.log("next week", addDays("2000-01-01T00:00"))

// var convertedTime = unixTimeStampToDate(1507343881).toISOString()
// console.log("date u2d", convertedTime)
// console.log("date d2u", dateToUnixTimeStamp(convertedTime))

// reference
// http://sharonkuo.me/dota2/tournament.html
// http://dev.dota2.com/showthread.php?t=47115

// get heroes
// https://api.steampowered.com/IEconDOTA2_570/GetHeroes/v0001/?key="+APIKEY
// var query = "https://api.steampowered.com/IEconDOTA2_570/GetHeroes/v0001/?key="+APIKEY

// load images
// http://cdn.dota2.com/apps/dota2/images/heroes/HERONAME_SUFFIX
// heroname can be extracted from the get heroes list
img_res = {
	sb: {format:'png', x:59, y:33},
	lg:{format:'png', x:205, y:105},
	full:{format:'png', x:256, y:144},
	vert:{format:'jpg', x:235, y:272}
}

// load team info
// https://api.steampowered.com/IDOTA2Match_570/GetTeamInfoByTeamID/v001/?key=APIKEY
// var query = "https://api.steampowered.com/IDOTA2Match_570/GetTeamInfoByTeamID/v001/?key="+APIKEY+"&teams_requested=1"

// load match info
// var query = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?matches_requested=1&key="+APIKEY
// var query = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?"//matches_requested=1&key="+APIKEY
// query += "&start_at_match_id="+3487334186
// query += "&key="+APIKEY
// console.log(query)

// load match details
// var query = "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?match_id=27110133&key="+APIKEY

// get vanity url -> get steam_id from username
// http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?vanityurl=gabelogannewell&key=494EDA5106EEEEBC4D9257A7515C51BB

// get player summaries
// var query = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?steamids="+steam32to64(89074334)+"&key="+APIKEY
// console.log(query)

// var query = "http://api.steampowered.com/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1/?key="+APIKEY
// rp({
// 	uri: query,
// 	json:true
// })
// .then(function(response){
// 	var l = response.result.matches.length;
// 	console.log('query count', query_count)
// 	console.log('matches count', l)
// 	console.log('first', response.result.matches[0].match_id, unixTimeStampToDate(response.result.matches[0].start_time))
// 	console.log('last', response.result.matches[l-1].match_id, unixTimeStampToDate(response.result.matches[l-1].start_time))
// })
// .catch(function (err) {
// 	console.log('error', err)
// });

GetMatchHistoryBySequenceNum = function(){
	var has_matches = true;
	var query_count = 0;
	var last_match_id = null;
	var max_query_count = 50;

	var query_matches = function(){
	
		var query = "http://api.steampowered.com/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1/?"
		query += "matches_requested=100&"
		if(last_match_id){
			query += "start_at_match_seq_num="+last_match_id+"&"
		}
		query += "key="+APIKEY

		rp({
			uri: query,
			json:true
		})
		.then(function(response){
			var l = response.result.matches.length;
			console.log('query count', query_count)
			console.log('matches count', l)
			console.log('first', response.result.matches[0].match_id, unixTimeStampToDate(response.result.matches[0].start_time))
			console.log('last', response.result.matches[l-1].match_id, unixTimeStampToDate(response.result.matches[l-1].start_time))

			last_match_id = response.result.matches[l-1].match_id;
			
			if(query_count < max_query_count){
				query_matches()
			}
			query_count++;
		})
		.catch(function (err) {
			console.log('error', err)
		});
	}
	query_matches()
}

// GetMatchHistoryBySequenceNum()

GetMatchHistory = function(){
	// max 500 matches and no support for date_min and date_max
	// https://www.reddit.com/r/DotA2/comments/2440gk/the_dota_2_web_api_is_still_broken/
	var has_matches = true;
	var query_count = 0;
	var max_query_count = 25;
	var last_match_id = null;
	var wait_time = 1000;

	var query_matches = function(){

		var query = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?"
		query += "matches_requested=100&"
		if(last_match_id){
			query += "start_at_match_id="+last_match_id+"&"
		}
		query+="key="+APIKEY

		console.log('---------------------------------')
		console.log('query', query)

		setTimeout(function(){
			rp({
				uri: query,
				json:true
			})
			.then(function(response){
				var l = response.result.matches.length;
				console.log('query count', query_count)
				console.log('matches count', l)
				if(l === 0){
					return 
				}
				console.log('first', response.result.matches[0].match_id, unixTimeStampToDate(response.result.matches[0].start_time))
				console.log('last', response.result.matches[l-1].match_id, unixTimeStampToDate(response.result.matches[l-1].start_time))
				last_match_id = response.result.matches[l-1].match_id;

				if(query_count < max_query_count){
					query_matches()
				}

				query_count++;
			})
			.catch(function (err) {
				console.log('error', err)
			});
		}, wait_time);
	}

	query_matches()
}
GetMatchHistory()