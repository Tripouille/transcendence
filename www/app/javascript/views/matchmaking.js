import * as GC from './garbage_collector';

const MatchmakingView = Backbone.View.extend({
	template: _.template($('#matchmakingTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
        this.$el.attr({id: 'matchmaking'});
        const matchmakingView = this;
        $.ajax('matchmaking', {
            success: function(data) {
				matchmakingView.displayPlayers(data);
                if (data.left_player != null && data.right_player != null)
                    matchmakingView.timer(data.match_id);
                else
                    matchmakingView.wait(data);
            }
        });
        return this;
    },

	displayPlayers: function(data) {
		if (data.left_player) {
			$('#left_player .player_name').removeClass('loading');
			$('#left_player .player_name').text(data.left_player.username);
		}
		if (data.right_player) {
			$('#right_player .player_name').removeClass('loading');
			$('#right_player .player_name').text(data.right_player.username);
		}
	},

    timer: function(match_id) {
        const $center = $('#center');
        $center.show();
        $center.text('3');
        const interval = GC.addInterval(function() {
            $center.text(Math.max(Number($center.text()) - 1, 1));
        }, 1000);
        GC.addTimeout(function() {
            GC.cleanInterval(interval);
            window.router.navigate('game/' + match_id, {trigger: true});
        }, 3000);
    },

    wait: function(data) {
        const matchmakingView = this;
        const waitInterval = GC.addInterval(function() {
            $.ajax('matches/' + data.match_id, {
                success: function(data) {
                    if (data.left_player != null && data.right_player != null) {
						matchmakingView.displayPlayers(data);
                        matchmakingView.timer(data.match_id);
                        GC.cleanInterval(waitInterval);
                    }
                }
            });
        }, 500);
    }
});

export default MatchmakingView;