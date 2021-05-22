import * as Pong from './animations/game';

const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function(matchId) {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
		Pong.connect(matchId);
        return this;
    }
});

export default GameView;