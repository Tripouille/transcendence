const LobbyView = Backbone.View.extend({
	template: _.template($('#lobbyTemplate').html()),

    render: function() {
        this.$el.html(this.template({
            leftPlayerId: 1,
            rightPlayerId: 2
        }));
		this.$el.attr({id: 'lobby'});
        return this;
    }
});

export default LobbyView;