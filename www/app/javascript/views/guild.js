export const GuildView = Backbone.View.extend({
    tagName: "tr",
    className: "guildDisplay",

    template: _.template( $('#guildDisplay').html()),

    render: function() {

        model.calculateRank();
        model.getActiveMembersNo();

        var guildTemplate = this.template(this.model.toJSON());
        this.$el.html(guildTemplate);
        return this;
    }
});