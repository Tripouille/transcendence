export const GuildView = Backbone.View.extend({

    tagName: "ul",
    className: "",

    template: _.template( $('#guildViewTemplate').html()),

    render: function() {
        var guildTemplate = this.template(this.model.toJSON());
        this.$el.html(guildTemplate);
        return this;
    }
});