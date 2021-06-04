import * as GC from './garbage_collector';

const LobbyView = Backbone.View.extend({
	template: _.template($('#lobbyTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
        this.$el.attr({id: 'lobby'});
        const lobbyView = this;
        $.ajax('matchmaking', {
            success: function(data) {
                const $left = $('#leftPlayer');
                const $right = $('#rightPlayer');
                $left.text(data.left_player);
                $right.text(data.right_player);
                if (data.left_player != null && data.right_player != null)
                    lobbyView.timer(data);
                else
                    lobbyView.wait(data);
            }
        });
        return this;
    },
    timer: function(match) {
        const $timer = $('#timer');
        $timer.show();
        $timer.text('3');
        const interval = GC.addInterval(function() {
            $timer.text(Math.max(Number($timer.text()) - 1, 1));
        }, 1000);
        GC.addTimeout(function() {
            GC.cleanInterval(interval);
            $timer.hide();
            window.router.navigate('game/' + match.id, {trigger: true});
        }, 3000);
    },
    wait: function(match) {
        const $left = $('#leftPlayer');
        const $right = $('#rightPlayer');
        const lobbyView = this;
        const waitInterval = GC.addInterval(function() {
            $.ajax('matches/' + match.id, {
                success: function(data) {
                    if (data.left_player != null && data.right_player != null) {
                        $left.text(data.left_player);
                        $right.text(data.right_player);
                        lobbyView.timer(data);
                        GC.cleanInterval(waitInterval);
                    }
                }
            });
        }, 1000);
    }
});

export default LobbyView;