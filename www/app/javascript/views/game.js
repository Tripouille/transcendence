import * as Pong from './animations/game';

const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function(matchId) {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
        $.ajax('matchside/' + matchId, {
            success: function(data) {
                Pong.connect(matchId, data.side);
            }
        });
        return this;
    }
});

export default GameView;