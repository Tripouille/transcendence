export const FiguresView = Backbone.View.extend({
    className: "guildFigures",

    template: _.template($('#guildFiguresTemplate').html()),

    render: function (guildId) {
        this.$el.empty();
        window.guilds.calculateRank();
        let model = window.guilds.findWhere({ id: guildId });
        if (model)
        {
            model.set({ "active_members": window.users.where({ guild_id: model.id }).length });
            model.set({ "created_at": (new Date(model.get("created_at"))).toDateString() });
            model.set({ "owner_name": window.users.findWhere({ id: model.get('owner_id') }).get('username') });
            this.$el.html(this.template(model.toJSON()));
            this.$el.html(this.template(model.toJSON())).ready(function () {
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
