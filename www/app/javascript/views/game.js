const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
		require('./animations/game');
        return this;
    }
});

export default GameView;