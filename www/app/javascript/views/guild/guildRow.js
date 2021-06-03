export const GuildRowView = Backbone.View.extend({
    tagName: "tr",
    className: "guildRow",

    template: _.template( $('#guildRow').html()),

    render: function() {
        var guildTemplate = this.template(this.model.toJSON());
        this.$el.html(guildTemplate);
        
        // if (window.currentUser.has("guild_id"))
        //     this.$el.append(_.template( $('#joinGuildButton').html()));
        return this;
    }
});