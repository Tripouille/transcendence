import { GuildsView } from 'views/guild/guilds';
import { GuildView } from 'views/guild/guild';
import { GuildNewView } from 'views/guild/guildNew';
import * as GC from 'views/garbage_collector';
import FriendsListView from 'views/friendsList';
import SelectModeView from 'views/selectMode';
import MatchmakingView from 'views/matchmaking';
import GameView from 'views/game';
import { User } from 'models/user';
import * as Pong from 'views/animations/game';

import { UserView } from './views/user/user';
import { UsersView } from 'views/users';
import { UserUpdateView } from './views/user/userUpdate';
import { UserCreateView } from './views/user/userCreate';

/* a voir pour supprimer plus tard */
window.currentUser = new User({ id: initCurrentUserId });

$(function() {
	window.friendsListView = new FriendsListView();

	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		guildsView: new GuildsView({ el: $main }),
		guildView: new GuildView({ el: $main }),
		guildNewView: new GuildNewView({ el: $main }),
		usersView: new UsersView({ el: $main }),
		gameView: new GameView({el: $main}),
		matchmakingView: new MatchmakingView({el: $main}),
		selectModeView: new SelectModeView({el: $main}),
		userView: new UserView({ el: $main }),
		userUpdateView: new UserUpdateView({ el: $main }),
		userCreateView: new UserCreateView({ el: $main }),

		routes: {
			"": "selectMode",
			"game": "selectMode",
			"game/matchmaking": "matchmaking",
			"game/:id": "game",
			"guilds": "guilds",
			"guilds/new": "newguild",
			"guilds/:id": "displayguild",
			"users": "users",
			"user": "user",
			"user/:id/edit": "updateUser",
			"user/:id/create": "createUser",
		},

		execute: function (callback, args, name) {
			this.clearAnimations();
			$main.empty();
			$('nav > a').removeClass('selected');
			callback.apply(this, args);
		},
		clearAnimations: function () {
			Pong.removeSubscription();
			GC.clearTimeoutsIntervals();
			$(document).off("keydown");
			$(document).off("keyup");
		},

		guilds: function () {
			$('#guild_link').addClass('selected');
			this.guildsView.render();
		},

		displayguild: function (id) {
			$('#guild_link').addClass('selected');
			this.guildView.render(parseInt(id));
		},

		newguild: function () {
			$('#guild_link').addClass('selected');
			this.guildNewView.render();
		},
		users: function () {
			$('#rank_link').addClass('selected');
			this.usersView.render();
		},
		selectMode: function () {
			$('#game_link').addClass('selected');
			this.selectModeView.render();
		},
		matchmaking: function() {
			$('#game_link').addClass('selected');
			this.matchmakingView.render();
		},
		game: function (id) {
			$('#game_link').addClass('selected');
			if (id == null) {
				this.navigate('game/matchmaking', {trigger: true});
				return ;
			}
			this.gameView.render(id);
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
