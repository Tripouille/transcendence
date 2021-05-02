import pong from './animations/game';

const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function() {
		console.log('render');
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
		pong();
        return this;
    }
});

export default GameView;