import * as GC from './garbage_collector';

const LobbyView = Backbone.View.extend({
	template: _.template($('#lobbyTemplate').html()),

    render: function(router) {
        this.$el.html(this.template({}));
        this.$el.attr({id: 'lobby'});
        const lobbyView = this;
        $.ajax('matchmaking', {
            success: function(data) {
                const $left = $('#leftPlayer');
                const $right = $('#rightPlayer');
                $left.text(data.left_player);
                $right.text(data.right_player);
                console.log('data : ', data);
                if (data.left_player != null && data.right_player != null) {
                    lobbyView.timer(router);
                }
                else
                    console.log('waiting for another player');
            }
        });
        return this;
    },
    timer: function(router) {
        const $timer = $('#timer');
        $timer.show();
        $timer.text('3');
        const interval = GC.addInterval(function() {
            $timer.text(Math.max(Number($timer.text()) - 1, 1));
        }, 1000);
        GC.addTimeout(function() {
            GC.cleanInterval(interval);
            $timer.hide();
            router.navigate('game', {trigger: true});
        }, 3000);
    }
});

export default LobbyView;