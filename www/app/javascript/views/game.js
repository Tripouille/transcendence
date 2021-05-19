import * as Pong from './animations/game';

const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
		Pong.connect();
        return this;
    }
});

export default GameView;