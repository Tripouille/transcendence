import * as GC from './garbage_collector';

const MatchmakingView = Backbone.View.extend({
	template: _.template($('#matchmakingTemplate').html()),

    render: function(match_id) {
        this.$el.html(this.template({}));
        this.$el.attr({id: 'matchmaking'});
		if (match_id) {
            $.ajax('matches/' + match_id, {
                success: function(data) {
					this.displayPlayers(data);
					this.timer(data.match_id);
                }.bind(this)
            });
		}
		else {
			$.ajax('matchmaking', {
				success: function(data) {
					this.displayPlayers(data);
					if (data.left_player != null && data.right_player != null)
						this.timer(data.match_id);
					else
						this.wait(data);
				}.bind(this)
			});
		}
        return this;
    },

	displayPlayers: function(data) {
		if (data.left_player) {
			$('#left_player .player_name').removeClass('loading');
			$('#left_player .player_name').text(data.left_player.username);
			this.displayAvatar(data.left_player.id, this.$el.find('article#left_player > div'));
		}
		if (data.right_player) {
			$('#right_player .player_name').removeClass('loading');
			$('#right_player .player_name').text(data.right_player.username);
			this.displayAvatar(data.right_player.id, this.$el.find('article#right_player > div'));
		}
	},
	displayAvatar: function(user_id, $img_div) {
		$.ajax({
			type: "GET",
			url: "users/" + user_id + "/avatar",
			xhrFields: {responseType: 'blob'},
		}).done(function(data) {
			const url = window.URL || window.webkitURL;
			const src = url.createObjectURL(data);
			$img_div.empty();
			$img_div.css('background-image', 'url(' + src + ')');
		});
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
        const waitInterval = GC.addInterval(function() {
            $.ajax('matches/' + data.match_id, {
                success: function(data) {
                    if (data.left_player != null && data.right_player != null) {
						this.displayPlayers(data);
                        this.timer(data.match_id);
                        GC.cleanInterval(waitInterval);
                    }
                }.bind(this)
            });
        }.bind(this), 500);
    }
});

export default MatchmakingView;