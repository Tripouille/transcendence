import * as Pong from './animations/game';
import * as Layout from './animations/layout';

const GameView = Backbone.View.extend({
	template: _.template($('#gameTemplate').html()),

    render: function(matchId) {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'game'});
		Layout.foldFriends();
		Layout.foldTchat();
        $.ajax('matchside/' + matchId, {
            success: function(data) {
                if (["lobby", "ready"].includes(data.status)) {
					console.log('Joining as ' + data.side + ' player.');
                    Pong.connect(matchId, data.side);
				}
                else if (data.status == "finished") {
                    console.log('This game is finished.');
                    window.router.navigate('game', true);
                }
				else if (data.side == "unknown") {
					console.log('Game currently playing, joining as spectator.');
					Pong.connect(matchId, data.side);
				}
				else {
					console.log('Forbidden. You may have opened the game in another tab or window.');
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