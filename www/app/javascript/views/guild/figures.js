export const FiguresView = Backbone.View.extend({
    className: "guildFigures",

    template: _.template($('#guildFiguresTemplate').html()),

    render: function (guildView) {
        this.$el.empty();

        if (guildView.guild)
        {
            guildView.guild.set({ "created_at": (new Date(guildView.guild.get("created_at"))).toDateString() });

            this.$el.html(this.template(guildView.guild.toJSON())).ready(function () {
                $('#rank1').prepend('<img src="assets/gemstone-gold.svg" width="50" alt="gemstone gold">');
                $('#rank2').prepend('<img src="assets/gemstone-silver.svg" width="50" alt="gemstone silver">');
                $('#rank3').prepend('<img src="assets/gemstone-copper.svg" width="50" alt="gemstone copper">');
            });
        }
        else
            Backbone.history.navigate('#guilds', { trigger: true });
        return this;
    }
});
