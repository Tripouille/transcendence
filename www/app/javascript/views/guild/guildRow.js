export const GuildRowView = Backbone.View.extend({
    tagName: "tr",
    className: "guildRow",

    template: _.template( $('#guildRow').html()),

    render: function() {
        var guildTemplate = this.template(this.model.toJSON());
        this.$el.html(guildTemplate);
        
        return this;
    }
});