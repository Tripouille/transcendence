import * as Pong from './animations/game';

const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function(matchId) {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
        $.ajax('matchside/' + matchId, {
            success: function(data) {
                if (["lobby", "ready"].includes(data.status))
                    Pong.connect(matchId, data.side);
                else {
                    console.log('This game is finished.');
                    window.router.navigate('game', true);
                }
            },
            error: function() {
                console.log('This game does not exist.');
                window.router.navigate('game', true);
            }
        });
        return this;
    }
});

export default GameView;