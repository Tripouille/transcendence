import { GuildsView } from 'views/guild/guilds';
import { GuildView } from 'views/guild/guild';
import { GuildNewView } from 'views/guild/guildNew';
import * as GC from 'views/garbage_collector';
import UsersView from 'views/users';
import SelectModeView from 'views/selectMode';
import MatchmakingView from 'views/matchmaking';
import GameView from 'views/game';
import { User } from 'models/user';
import * as Pong from 'views/animations/game';
import { Users } from 'collections/users';

import { Guilds } from 'collections/guilds';
import { Invites } from 'collections/invites';

window.intervals = new Array();
window.timeouts = new Array();

/* a voir pour supprimer plus tard */
window.currentUser = new User({ id: initCurrentUser.id });

/* Creation des instances de collections ici, pour les fetch dans leur view respectives (gain perf.) */
window.users = new Users();
window.guilds = new Guilds();
window.invites = new Invites();

$(function () {

	const $main = $('main');
	const myRouter = Backbone.Router.extend({
		guildsView: new GuildsView({ el: $main }),
		guildView: new GuildView({ el: $main }),
		guildNewView: new GuildNewView({ el: $main }),
		usersView: new UsersView(),
		gameView: new GameView({el: $main}),
		matchmakingView: new MatchmakingView({el: $main}),
		selectModeView: new SelectModeView({el: $main}),

		routes: {
			"": "selectMode",
			"game": "selectMode",
			"game/matchmaking": "matchmaking",
			"game/:id": "game",
			"guilds": "guilds",
			"guilds/new": "newguild",
			"guilds/:id": "displayguild",
			"game": "game",
			"users": "users"
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
			console.log("> guilds - page");
			this.guildsView.render();
		},

		displayguild: function (id) {
			console.log("> guilds - No" + id);
			this.guildView.render(parseInt(id));
		},

		newguild: function () {
			console.log("> guilds - page #new");
			this.guildNewView.render();
		},
		users: function () {
			$('#rank_link').addClass('selected');
			this.usersView.render($main);
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
	});
	window.router = new myRouter();
	Backbone.history.start();
});
