import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Paper from 'material-ui/Paper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import io from 'socket.io-client';
//eslint-disable-next-line
var host = location.protocol+'//'+location.hostname+":3001"
let socket = io(host)

class MAppBar extends Component {

	onHome = function(){
		console.log('onHome')
		this.props.history.push('/')
	}

	render(){
		return (
			<AppBar
				title={this.props.title}
				iconElementLeft={<IconButton><NavigationClose /></IconButton>}
				onLeftIconButtonTouchTap={this.onHome.bind(this)}
			/>
		)
	}
}

class SummonerHeader extends Component {

}

class ChampionRow extends Component {
	render(){
		// console.log('props', this.props)
		var scope = this;
		return (
			<TableRow>
				{ this.props.labels.map(function(item, index){
					return <TableRowColumn key={index}>
										{scope.props.data[item]}
								 </TableRowColumn>
				})}

			</TableRow>
		)
	}
}

// smart tabs
// https://github.com/callemall/material-ui/issues/1352
class ChampionSeason extends Component {
	render(){
		// console.log(this.props.data)
		var scope = this;
		var champion_ids = Object.keys(this.props.data);
		var labels = Object.keys(this.props.data[champion_ids[0]])

		// console.log('labels', labels)

		return (
			<div>
				  <Table>
    				<TableHeader displaySelectAll={false} adjustForCheckbox={false}>
    					<TableRow>
	    					{ labels.map(function(item, index){
		    					return <TableHeaderColumn key={index}>
		    									{item}
		    								</TableHeaderColumn>
	    					})}
    					</TableRow>
    				</TableHeader>
    				<TableBody displayRowCheckbox={false}>
    					{ champion_ids.map(function(item, index){
	    					return <ChampionRow key={index} labels={labels} data={scope.props.data[item]}/>
    					})}
		      	</TableBody>
    			</Table>
			</div>
		)
	}
}

class ChampionsMatch extends Component {
	render(){
		return (
			<div>
				<div className="ChampionMatch-image">
					<img src={'http://ddragon.leagueoflegends.com/cdn/7.20.2/img/champion/'+this.props.data.championName+'.png'}/>
				</div>
				<div>
					{this.props.data.lane}
				</div>
			</div>
		)
	}
}

class ChampionsMatches extends Component {
	constructor(props){
		super(props)

		var scope = this;
		this._mounted = false;
		this.data = {}
		this.state = {matches:false}

		socket.on('summoner:getRecentMatches', function(res){
			if(scope._mounted && res.data){
				console.log('got matches')
				scope.data['matches'] = res.data;
				scope.setState({'matches':true})
			}
		})
	}

	componentDidMount() {
		console.log('componentDidMount')
		this._mounted = true;
		socket.emit('summoner:getRecentMatches', {
			accountId:this.props.accountId
		})
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render(){
		console.log('render', this.props)
		console.log('data', this.data)
		var scope = this;
		return (
			<div className='Summoner-matches'>
				{!this.state.matches && 
					<div>
						Loading ...
					</div>
				}
				{this.state.matches && 
					scope.data.matches.matches.map(function(item, index){
						return <ChampionsMatch key={index} data={item}/>
					})
				}
			</div>
		)
	}
}

class ChampionsLayout extends Component {
	constructor(props){
		super(props)
		
		this.state = {
			value: 0,
		};
		// console.log(props)
	}

	handleChange = function(value){
		console.log('handleChange', value)
		this.setState({
			value: value,
		});
	};

	render(){
		var scope = this;
		var seasons = Object.keys(this.props.data)

		return (
			<Tabs
        value={this.state.value}
        onChange={this.handleChange.bind(this)}
      >

      {seasons.map(function(item, index){
      	return <Tab
      						key={index}
      						label={item}
      						value={index}>
      						<ChampionSeason data={scope.props.data[item]}/>
      					</Tab>
      })}

      </Tabs>
		)
	}
}

class Summoner extends Component {
	constructor(props){
		super(props)

		var scope = this;
		this._mounted = false;
		this.state = {user:false};
		this.data = {};
		this.data['champions'] = JSON.parse('{"season_3":{"5":{"name":"XinZhao","played":2,"win":2,"lose":0,"kills":10.5,"deaths":5,"assists":11,"CS":30.5,"turretKills":0.5,"doubleKills":2,"tripleKills":0,"quadraKills":0,"maxKills":11,"maxDeaths":7,"totalDamageDealt":102853,"totalDamageTaken":26851.5},"11":{"name":"MasterYi","played":1,"win":1,"lose":0,"kills":16,"deaths":9,"assists":15,"CS":108,"turretKills":3,"doubleKills":3,"tripleKills":0,"quadraKills":0,"maxKills":16,"maxDeaths":9,"totalDamageDealt":215786,"totalDamageTaken":31633},"53":{"name":"Blitzcrank","played":2,"win":1,"lose":1,"kills":3,"deaths":11.5,"assists":15.5,"CS":40.5,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":4,"maxDeaths":12,"totalDamageDealt":60325,"totalDamageTaken":29256.5},"55":{"name":"Katarina","played":1,"win":0,"lose":1,"kills":6,"deaths":13,"assists":19,"CS":38,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":6,"maxDeaths":13,"totalDamageDealt":57626,"totalDamageTaken":21542},"59":{"name":"JarvanIV","played":7,"win":4,"lose":3,"kills":9.285714285714286,"deaths":7.428571428571429,"assists":12.857142857142858,"CS":55.285714285714285,"turretKills":0.42857142857142855,"doubleKills":2,"tripleKills":0,"quadraKills":0,"maxKills":22,"maxDeaths":12,"totalDamageDealt":101505,"totalDamageTaken":25389.428571428572},"64":{"name":"LeeSin","played":3,"win":1,"lose":2,"kills":7,"deaths":9.666666666666666,"assists":6.666666666666667,"CS":32.666666666666664,"turretKills":0.3333333333333333,"doubleKills":4,"tripleKills":0,"quadraKills":0,"maxKills":9,"maxDeaths":14,"totalDamageDealt":71489.66666666667,"totalDamageTaken":23119},"80":{"name":"Pantheon","played":3,"win":0,"lose":3,"kills":4.666666666666667,"deaths":9,"assists":8.666666666666666,"CS":41.333333333333336,"turretKills":1,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":7,"maxDeaths":11,"totalDamageDealt":96865,"totalDamageTaken":24378.666666666668},"86":{"name":"Garen","played":20,"win":13,"lose":7,"kills":9.95,"deaths":6.6,"assists":9.15,"CS":111.8,"turretKills":0.75,"doubleKills":19,"tripleKills":3,"quadraKills":0,"maxKills":36,"maxDeaths":14,"totalDamageDealt":95563.85,"totalDamageTaken":25216.9},"111":{"name":"Nautilus","played":1,"win":0,"lose":1,"kills":3,"deaths":6,"assists":3,"CS":18,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":3,"maxDeaths":6,"totalDamageDealt":54496,"totalDamageTaken":13489},"122":{"name":"Darius","played":2,"win":1,"lose":1,"kills":7.5,"deaths":8,"assists":9.5,"CS":86,"turretKills":1.5,"doubleKills":1,"tripleKills":0,"quadraKills":0,"maxKills":10,"maxDeaths":13,"totalDamageDealt":65816,"totalDamageTaken":20992.5},"157":{"name":"Yasuo","played":3,"win":1,"lose":2,"kills":5,"deaths":9.333333333333334,"assists":4.333333333333333,"CS":92,"turretKills":0.3333333333333333,"doubleKills":2,"tripleKills":1,"quadraKills":0,"maxKills":7,"maxDeaths":13,"totalDamageDealt":106862.66666666667,"totalDamageTaken":21291},"236":{"name":"Lucian","played":1,"win":0,"lose":1,"kills":8,"deaths":11,"assists":16,"CS":197,"turretKills":0,"doubleKills":1,"tripleKills":0,"quadraKills":0,"maxKills":8,"maxDeaths":11,"totalDamageDealt":202746,"totalDamageTaken":30439},"412":{"name":"Thresh","played":3,"win":1,"lose":2,"kills":3.6666666666666665,"deaths":6.666666666666667,"assists":13,"CS":20,"turretKills":0.3333333333333333,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":9,"maxDeaths":8,"totalDamageDealt":21099.333333333332,"totalDamageTaken":21428.666666666668}}, "season_5":{"5":{"name":"XinZhao","played":2,"win":1,"lose":1,"kills":1.5,"deaths":4.5,"assists":1.5,"CS":2,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":3,"maxDeaths":7,"totalDamageDealt":21893.5,"totalDamageTaken":8354},"7":{"name":"Leblanc","played":1,"win":0,"lose":1,"kills":1,"deaths":2,"assists":1,"CS":66,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":1,"maxDeaths":2,"totalDamageDealt":27471,"totalDamageTaken":5454},"13":{"name":"Ryze","played":1,"win":0,"lose":1,"kills":3,"deaths":7,"assists":2,"CS":107,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":3,"maxDeaths":7,"totalDamageDealt":55714,"totalDamageTaken":17043},"22":{"name":"Ashe","played":2,"win":1,"lose":1,"kills":10,"deaths":6.5,"assists":14,"CS":86,"turretKills":1,"doubleKills":2,"tripleKills":1,"quadraKills":1,"maxKills":12,"maxDeaths":12,"totalDamageDealt":76292.5,"totalDamageTaken":16635},"23":{"name":"Tryndamere","played":1,"win":0,"lose":1,"kills":4,"deaths":7,"assists":7,"CS":97,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":4,"maxDeaths":7,"totalDamageDealt":67766,"totalDamageTaken":24038},"24":{"name":"Jax","played":1,"win":0,"lose":1,"kills":1,"deaths":6,"assists":1,"CS":52,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":1,"maxDeaths":6,"totalDamageDealt":26220,"totalDamageTaken":10330},"31":{"name":"Chogath","played":14,"win":6,"lose":8,"kills":6.642857142857143,"deaths":6.857142857142857,"assists":7.142857142857143,"CS":127.64285714285714,"turretKills":0.5714285714285714,"doubleKills":9,"tripleKills":1,"quadraKills":0,"maxKills":12,"maxDeaths":11,"totalDamageDealt":106464.64285714286,"totalDamageTaken":24957.35714285714},"45":{"name":"Veigar","played":16,"win":6,"lose":10,"kills":6.9375,"deaths":6.625,"assists":7.1875,"CS":140.125,"turretKills":0.25,"doubleKills":9,"tripleKills":2,"quadraKills":0,"maxKills":18,"maxDeaths":12,"totalDamageDealt":129357.6875,"totalDamageTaken":17909.375},"53":{"name":"Blitzcrank","played":47,"win":23,"lose":24,"kills":3.127659574468085,"deaths":7.23404255319149,"assists":13.553191489361701,"CS":33.97872340425532,"turretKills":0.3191489361702128,"doubleKills":1,"tripleKills":0,"quadraKills":0,"maxKills":13,"maxDeaths":13,"totalDamageDealt":35280.55319148936,"totalDamageTaken":24723.425531914894},"55":{"name":"Katarina","played":11,"win":4,"lose":7,"kills":6.090909090909091,"deaths":7.909090909090909,"assists":7.2727272727272725,"CS":125.54545454545455,"turretKills":0.36363636363636365,"doubleKills":8,"tripleKills":5,"quadraKills":0,"maxKills":15,"maxDeaths":17,"totalDamageDealt":102278.90909090909,"totalDamageTaken":19148.636363636364},"58":{"name":"Renekton","played":1,"win":0,"lose":1,"kills":3,"deaths":11,"assists":1,"CS":173,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":3,"maxDeaths":11,"totalDamageDealt":160993,"totalDamageTaken":35468},"59":{"name":"JarvanIV","played":12,"win":5,"lose":7,"kills":5,"deaths":6.916666666666667,"assists":8.333333333333334,"CS":36.083333333333336,"turretKills":0.3333333333333333,"doubleKills":3,"tripleKills":1,"quadraKills":0,"maxKills":12,"maxDeaths":12,"totalDamageDealt":88504.75,"totalDamageTaken":23485.666666666668},"64":{"name":"LeeSin","played":15,"win":8,"lose":7,"kills":4.866666666666666,"deaths":7.8,"assists":8.4,"CS":32.2,"turretKills":0.2,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":13,"maxDeaths":15,"totalDamageDealt":105191.66666666667,"totalDamageTaken":26999.333333333332},"67":{"name":"Vayne","played":2,"win":1,"lose":1,"kills":6.5,"deaths":2,"assists":5.5,"CS":57.5,"turretKills":0.5,"doubleKills":1,"tripleKills":0,"quadraKills":0,"maxKills":11,"maxDeaths":4,"totalDamageDealt":37687,"totalDamageTaken":6860},"80":{"name":"Pantheon","played":2,"win":1,"lose":1,"kills":5.5,"deaths":4,"assists":7,"CS":10,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":6,"maxDeaths":6,"totalDamageDealt":68292,"totalDamageTaken":15669.5},"81":{"name":"Ezreal","played":1,"win":0,"lose":1,"kills":4,"deaths":7,"assists":6,"CS":181,"turretKills":1,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":4,"maxDeaths":7,"totalDamageDealt":160504,"totalDamageTaken":23563},"86":{"name":"Garen","played":29,"win":17,"lose":12,"kills":8.551724137931034,"deaths":5.344827586206897,"assists":6.241379310344827,"CS":171.58620689655172,"turretKills":1.4482758620689655,"doubleKills":26,"tripleKills":3,"quadraKills":1,"maxKills":20,"maxDeaths":12,"totalDamageDealt":151026.4827586207,"totalDamageTaken":28678.724137931036},"111":{"name":"Nautilus","played":50,"win":23,"lose":27,"kills":2.54,"deaths":6.32,"assists":12.22,"CS":41.34,"turretKills":0.24,"doubleKills":4,"tripleKills":0,"quadraKills":0,"maxKills":9,"maxDeaths":13,"totalDamageDealt":48651,"totalDamageTaken":22681.1},"115":{"name":"Ziggs","played":2,"win":0,"lose":2,"kills":3,"deaths":5.5,"assists":7.5,"CS":124,"turretKills":0.5,"doubleKills":1,"tripleKills":0,"quadraKills":0,"maxKills":5,"maxDeaths":8,"totalDamageDealt":130658.5,"totalDamageTaken":14100.5},"121":{"name":"Khazix","played":1,"win":0,"lose":1,"kills":1,"deaths":7,"assists":1,"CS":4,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":1,"maxDeaths":7,"totalDamageDealt":39972,"totalDamageTaken":14509},"157":{"name":"Yasuo","played":186,"win":83,"lose":103,"kills":6.779569892473118,"deaths":7.521505376344086,"assists":8.790322580645162,"CS":169.95698924731184,"turretKills":1.0483870967741935,"doubleKills":141,"tripleKills":19,"quadraKills":0,"maxKills":24,"maxDeaths":19,"totalDamageDealt":166977.188172043,"totalDamageTaken":22997.021505376346},"236":{"name":"Lucian","played":4,"win":3,"lose":1,"kills":6,"deaths":5.75,"assists":5.5,"CS":146.5,"turretKills":0.75,"doubleKills":2,"tripleKills":1,"quadraKills":0,"maxKills":11,"maxDeaths":10,"totalDamageDealt":109124.75,"totalDamageTaken":14446.75},"238":{"name":"Zed","played":2,"win":1,"lose":1,"kills":5.5,"deaths":8.5,"assists":5,"CS":142.5,"turretKills":2,"doubleKills":1,"tripleKills":0,"quadraKills":0,"maxKills":10,"maxDeaths":15,"totalDamageDealt":116557,"totalDamageTaken":25499.5},"412":{"name":"Thresh","played":17,"win":7,"lose":10,"kills":1.4705882352941178,"deaths":6.882352941176471,"assists":11.764705882352942,"CS":17.705882352941178,"turretKills":0.29411764705882354,"doubleKills":2,"tripleKills":0,"quadraKills":0,"maxKills":3,"maxDeaths":13,"totalDamageDealt":15804.35294117647,"totalDamageTaken":19856.58823529412}},"season_7":{"5":{"name":"XinZhao","played":1,"win":0,"lose":1,"kills":2,"deaths":4,"assists":1,"CS":20,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":2,"maxDeaths":4,"totalDamageDealt":82391,"totalDamageTaken":20043},"7":{"name":"Leblanc","played":1,"win":0,"lose":1,"kills":2,"deaths":20,"assists":17,"CS":26,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":2,"maxDeaths":20,"totalDamageDealt":42713,"totalDamageTaken":31936},"17":{"name":"Teemo","played":1,"win":0,"lose":1,"kills":7,"deaths":13,"assists":7,"CS":29,"turretKills":0,"doubleKills":2,"tripleKills":0,"quadraKills":0,"maxKills":7,"maxDeaths":13,"totalDamageDealt":37276,"totalDamageTaken":22422},"20":{"name":"Nunu","played":1,"win":1,"lose":0,"kills":7,"deaths":9,"assists":33,"CS":25,"turretKills":0,"doubleKills":1,"tripleKills":0,"quadraKills":0,"maxKills":7,"maxDeaths":9,"totalDamageDealt":47695,"totalDamageTaken":41349},"24":{"name":"Jax","played":1,"win":0,"lose":1,"kills":5,"deaths":9,"assists":7,"CS":48,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":5,"maxDeaths":9,"totalDamageDealt":44942,"totalDamageTaken":27350},"25":{"name":"Morgana","played":1,"win":1,"lose":0,"kills":9,"deaths":0,"assists":3,"CS":52,"turretKills":1,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":9,"maxDeaths":0,"totalDamageDealt":39229,"totalDamageTaken":3562},"31":{"name":"Chogath","played":6,"win":3,"lose":3,"kills":4,"deaths":5.5,"assists":5.833333333333333,"CS":129.5,"turretKills":0.3333333333333333,"doubleKills":1,"tripleKills":1,"quadraKills":0,"maxKills":7,"maxDeaths":8,"totalDamageDealt":110133.5,"totalDamageTaken":27587.166666666668},"45":{"name":"Veigar","played":20,"win":7,"lose":13,"kills":6.2,"deaths":7.45,"assists":8.6,"CS":132.95,"turretKills":0.5,"doubleKills":5,"tripleKills":2,"quadraKills":0,"maxKills":14,"maxDeaths":17,"totalDamageDealt":124259.05,"totalDamageTaken":16172.6},"53":{"name":"Blitzcrank","played":121,"win":72,"lose":49,"kills":3.4049586776859506,"deaths":6.694214876033058,"assists":13.983471074380166,"CS":29.785123966942148,"turretKills":0.3140495867768595,"doubleKills":16,"tripleKills":1,"quadraKills":0,"maxKills":13,"maxDeaths":16,"totalDamageDealt":30909.743801652894,"totalDamageTaken":22584.545454545456},"55":{"name":"Katarina","played":6,"win":3,"lose":3,"kills":6.666666666666667,"deaths":5.5,"assists":5.166666666666667,"CS":111.66666666666667,"turretKills":0.5,"doubleKills":4,"tripleKills":1,"quadraKills":0,"maxKills":9,"maxDeaths":11,"totalDamageDealt":98571.66666666667,"totalDamageTaken":15153.833333333334},"59":{"name":"JarvanIV","played":1,"win":0,"lose":1,"kills":6,"deaths":10,"assists":10,"CS":70,"turretKills":0,"doubleKills":0,"tripleKills":0,"quadraKills":0,"maxKills":6,"maxDeaths":10,"totalDamageDealt":118537,"totalDamageTaken":26832},"67":{"name":"Vayne","played":1,"win":1,"lose":0,"kills":15,"deaths":4,"assists":9,"CS":64,"turretKills":3,"doubleKills":2,"tripleKills":0,"quadraKills":0,"maxKills":15,"maxDeaths":4,"totalDamageDealt":78213,"totalDamageTaken":10081},"80":{"name":"Pantheon","played":12,"win":7,"lose":5,"kills":7.583333333333333,"deaths":6,"assists":7.333333333333333,"CS":90,"turretKills":0.5833333333333334,"doubleKills":10,"tripleKills":0,"quadraKills":0,"maxKills":15,"maxDeaths":12,"totalDamageDealt":71814.83333333333,"totalDamageTaken":19431.833333333332},"86":{"name":"Garen","played":8,"win":4,"lose":4,"kills":5.5,"deaths":6.5,"assists":7.875,"CS":143.25,"turretKills":0.75,"doubleKills":2,"tripleKills":1,"quadraKills":0,"maxKills":9,"maxDeaths":15,"totalDamageDealt":125145.5,"totalDamageTaken":28234.875},"111":{"name":"Nautilus","played":28,"win":15,"lose":13,"kills":2.892857142857143,"deaths":6.857142857142857,"assists":15.642857142857142,"CS":50.964285714285715,"turretKills":0.35714285714285715,"doubleKills":3,"tripleKills":0,"quadraKills":0,"maxKills":9,"maxDeaths":13,"totalDamageDealt":49706,"totalDamageTaken":25052.571428571428},"143":{"name":"Zyra","played":1,"win":1,"lose":0,"kills":29,"deaths":2,"assists":6,"CS":139,"turretKills":2,"doubleKills":4,"tripleKills":1,"quadraKills":0,"maxKills":29,"maxDeaths":2,"totalDamageDealt":135850,"totalDamageTaken":7971},"157":{"name":"Yasuo","played":111,"win":62,"lose":49,"kills":7.711711711711712,"deaths":6.783783783783784,"assists":8.441441441441441,"CS":179.05405405405406,"turretKills":1.3333333333333333,"doubleKills":110,"tripleKills":13,"quadraKills":1,"maxKills":22,"maxDeaths":17,"totalDamageDealt":179451.02702702704,"totalDamageTaken":25646.765765765766},"238":{"name":"Zed","played":11,"win":7,"lose":4,"kills":7.7272727272727275,"deaths":5.454545454545454,"assists":5.454545454545454,"CS":125,"turretKills":0.7272727272727273,"doubleKills":6,"tripleKills":1,"quadraKills":0,"maxKills":19,"maxDeaths":15,"totalDamageDealt":102871.90909090909,"totalDamageTaken":17243.636363636364},"412":{"name":"Thresh","played":16,"win":5,"lose":11,"kills":2.3125,"deaths":8,"assists":11.1875,"CS":38,"turretKills":0.25,"doubleKills":2,"tripleKills":0,"quadraKills":0,"maxKills":7,"maxDeaths":16,"totalDamageDealt":29550.875,"totalDamageTaken":22772.25}}}')
		console.log(this.data)

		socket.on('summoner:getByName', function(res){
			if(scope._mounted && res.data){
				scope.data['user'] = res.data;
				scope.setState({'user':true})
			}
		})
	}

	componentDidMount() {
		this._mounted = true;
		socket.emit('summoner:getByName', {
			name:this.props.match.params.summonerId
		})
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render(){
		var scope = this;
		
		console.log('user data', this.data.user)

		return (
			<div>
				<div>
					<MAppBar history={this.props.history} title="Summoner Details"/>
				</div>
				<div className='Summoner-splash'>
					{ this.state.user &&
						<div>
							<div className='Summoner-intro'>
								<div className='Summoner-intro-image'>
									<img src={'http://ddragon.leagueoflegends.com/cdn/7.20.2/img/profileicon/'+scope.data.user.profileIconId+'.png'} alt="profile"></img>						
								</div>
								<div className='Summoner-intro-details'>
									<div>Name: {scope.data.user.name} </div>
									<div>Level: {scope.data.user.summonerLevel} </div>
								</div>
							</div>

							<ChampionsMatches accountId={scope.data.user.accountId}/>
						</div>
					}
					{!this.state.user && 
						<div>
						Loading ...
						</div>
					}
				</div>
			</div>
		)
	}
}

class Home extends Component {
	constructor(props){
		super(props)
		this.text = undefined;
	}

	onSearch(){
		if(this.text !== undefined){
			console.log('searching', this.text)
			var route = '/summoner/'+this.text;
			this.props.history.push(route)
		}
	}

	onSurpriseMe(){
		console.log('suprise me')
		this.text = 'SerMeowington';
		this.onSearch()
	}
	
	onTextChange(event, value){
		console.log('typing', value)
		this.text = value;
	}

	onKeyPress(event){
		console.log('enter')
		if (event.key === 'Enter'){
			this.onSearch()
		}
	}

	render(){
		const style = {
		  height: 60,
		  width: '100%',
		  margin: '0 30 0 30',
		  textAlign: 'center',
		  display: 'inline-block',
		};

		return (
			<div>
				<div className='Home-splash'>
					<img src="./splash.jpg" alt="splash"></img>
					<Paper style={style} zDepth={1}>
						<TextField 
							style={{width:'90%'}} 
							onKeyPress={this.onKeyPress.bind(this)} 
							onChange={this.onTextChange.bind(this)} 
							hintText="Enter Summoner name"/>
						<br/>
					</Paper>
					<center>
						<RaisedButton 
							style={{margin:'10px'}} 
							onClick={this.onSearch.bind(this)} 
							label="Search"/>
						<RaisedButton 
							style={{margin:'10px'}} 
							onClick={this.onSurpriseMe.bind(this)} 
							label="Suprise Me"/>
					</center>
				</div>
			</div>
		)
	}
}

class App extends Component {
	constructor(props){
		super(props)

		socket.on('disconnect', function(){
			socket.close();
		});
		
		socket.on('init', function(){
			console.log('init')			
			// socket.emit('summoner', {name:'test'})
		});
	}

	render() {
		return (
			<MuiThemeProvider>
				<Router>
					<div>
						<Route exact path="/" render={(props) => (
							<Home {...props}/>
						)}/>
						<Route exact path="/summoner/:summonerId" render={(props) => (
							<Summoner {...props}/>
						)}/>
					</div>
				</Router>
			</MuiThemeProvider>
		);
	}
}

export default App;
