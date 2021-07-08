import { MatchesView } from './matches';
import { User } from '../../models/user';

export const RankView = Backbone.View.extend({
	matchesView: new MatchesView(),
	user: new User(),

	render: function (userId) {
		this.$el.empty();
		this.$el.attr({ id: 'rankPage' });
		this.user.set({ id: userId });
		let self = this;

		$.when(this.user.fetch(), window.currentUser.fetch()).then(
			function success() {
				$('main#rankPage').prepend('<div id="guildNavbar"><a class="button Cancel" href="#user/' + userId + '/show">Back</a></div>');
				$('main#rankPage').append(self.matchesView.render(self).el);
			},
			function error() {
				Backbone.history.navigate("users", { trigger: true });
			}
		);
		return this;
	}
});
