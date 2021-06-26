import * as GC from 'views/garbage_collector';
import FriendsListView from 'views/friendsList';
import UsersView from 'views/users';
import SelectModeView from 'views/selectMode';
import MatchmakingView from 'views/matchmaking';
import GameView from 'views/game';
import * as Pong from 'views/animations/game';

//import { HomepageView } from 'views/homepageView';

import { LoginView } from 'views/login';
import { UserView } from './views/user/user';
import { UserUpdateView } from './views/user/userUpdate';
import { UserCreateView } from './views/user/userCreate';
//import { GuildsCollection } from "collections/guildsCollection"

console.log(initCurrentUserId);

$(function() {
	window.friendsListView = new FriendsListView();

	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		usersView: new UsersView(),
		gameView: new GameView({el: $main}),
		matchmakingView: new MatchmakingView({el: $main}),
		selectModeView: new SelectModeView({el: $main}),
		loginView:	new LoginView({ el: $main }),
		userView: new UserView({ el: $main }),
		userUpdateView: new UserUpdateView({ el: $main }),
		userCreateView: new UserCreateView({ el: $main }),

		routes: {
			"": "selectMode",
			"game": "selectMode",
			"game/matchmaking": "matchmaking",
			"game/:id": "game",
			"users": "users",
			"user": "user",
			"user/:id/edit": "updateUser",
			"user/:id/create": "createUser",
			"login": "login",
		},

		execute: function(callback, args, name) {
			this.clearAnimations();
			$main.empty();
			$('nav > a').removeClass('selected');
			callback.apply(this, args);
		},
		clearAnimations: function() {
			Pong.removeSubscription();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");
		},

		users: function() {
			$('#rank_link').addClass('selected');
			this.usersView.render($main);
		},
		selectMode: function() {
			$('#game_link').addClass('selected');
			this.selectModeView.render();
		},
		matchmaking: function() {
			$('#game_link').addClass('selected');
			this.matchmakingView.render();
		},
		game: function(id) {
			$('#game_link').addClass('selected');
			if (id == null) {
				this.navigate('game/matchmaking', {trigger: true});
				return ;
			}
			this.gameView.render(id);
		},
		login: function() {
			console.log("> Login - Page");
			this.loginView.render();
		},

		user: function() {
			console.log("> User - Page")
			this.userView.render();
		},

		updateUser: function(id) {
			console.log("> Update User - Page - " + id)
			this.userUpdateView.render(id);
		},

		createUser: function(id) {
			console.log("> Create User - Page - " + id)
			this.userCreateView.render(id);
		}
	});
	window.router = new myRouter();
	Backbone.history.start();
});
