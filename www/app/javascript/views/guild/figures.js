import { GuildsCollection } from 'collections/guilds';
import { Users } from 'collections/users';

export const FiguresView = Backbone.View.extend({
    className: "guildFigures",

    template: _.template($('#guildFiguresTemplate').html()),

    render: function(guildId) {
        this.$el.empty();
        let el = this.$el;
        let self = this;

        let guilds = new GuildsCollection();
        let guildsFetch = guilds.fetch();
        let users = new Users();
		let usersFetch = users.fetch();

        $.when(guildsFetch, usersFetch).done(function () {
                guilds.calculateRank();
                let model = guilds.findWhere({ id: parseInt(guildId) });
                model.set({ "active_members": users.where({ guild_id: model.id }).length });
                model.set({ "created_at": (new Date(model.get("created_at"))).toDateString() });
                let guildTemplate = self.template(model.toJSON());
                el.html(guildTemplate);
            },
            // function onFailure() {
            //     console.log("fetched guild-collection with failure");
            // },
        );
        return this;
    }
});