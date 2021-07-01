import { MatchesView } from 'views/matches';
import { User } from 'models/user';

export const UserDisplay = Backbone.View.extend({
	matchesView: new MatchesView(),
	user: new User(),

	render: function (userId) {
		this.$el.empty();
		this.$el.attr({ id: 'guilds' });
		this.user.set({ id: userId });
		let self = this;

		$.when(this.user.fetch(), window.currentUser.fetch()).then(
			function success() {
				self.$el.prepend('<div id="guildNavbar"><a class="button Cancel" href="#users">Back</a></div>');
				self.$el.append(self.matchesView.render(self).el);
			},
			function error() {
				Backbone.history.navigate("users", { trigger: true });
			}
		);
		return this;
	}
});
