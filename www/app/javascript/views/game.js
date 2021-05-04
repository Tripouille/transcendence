import * as Pong from './animations/game';

const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
		Pong.start();
        return this;
    }
});

export default GameView;