const SelectModeView = Backbone.View.extend({
	template: _.template($('#selectModeTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'selectMode'});
		// const selectModeView = this;
		// $.ajax('alreadyingame', {
		// 	success: function(match) {
		// 		if (match) {
		// 			const p = selectModeView.$el.find('p');
		// 			p.html('<a href="#game/' + match.id + '">Reconnect</a>');
		// 		}
		// 	}
		// });
		return this;
	}
});

export default SelectModeView;