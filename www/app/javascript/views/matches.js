import { Matches } from 'collections/matches';

export const MatchesView = Backbone.View.extend({
	className: "userMatches",
	template: _.template($('#userMatchesTemplate').html()),
	rowTemplate: _.template($('#userMatchRowTemplate').html()),

	render: function (userView) {
		this.$el.empty();
		let self = this;

		let filteredCollection = new Matches(userView.user.get('matches'));

		if (filteredCollection) {
			this.$el.html(this.template).ready(function () {
				filteredCollection.forEach(function (match) {
					$("#userMatchesBody").append(self.rowTemplate(match.toJSON()));
				});
			});
		}
		else
			Backbone.history.navigate('#users', { trigger: true });
		return this;
	}
});
