// import { GuildsCollection } from 'collections/guilds';
// import { Users } from 'collections/users';

export const WarHistoryView = Backbone.View.extend({
    className: "warHistory",

    template: _.template($('#guildWarHistory').html()),

    render: function (guildId) {
        this.$el.empty();
        let navbarTemplate = _.template($('#guildsNavbarTemplate').html());
        this.$el.prepend(navbarTemplate({ guild_id: guildId }));
        this.$el.append(this.template);

        // this.$el.append(this.warHistoryView.render(guildId).el);


        // if (guild = atWar)
        //     this.$el.append(this.warSummaryView.render(guildId).el);

        /* to implement */
        // if (user = notinguild)
        //     this.$el.append(this.joinGuildView.render(guildId).el);



        // let guilds = new GuildsCollection();
        // let guildsFetch = guilds.fetch();
        // let users = new Users();
        // let usersFetch = users.fetch();

        // $.when(guildsFetch, usersFetch).done(function () {
        //         guilds.calculateRank();
        //         let model = guilds.findWhere({ id: parseInt(guildId) });
        //         model.set({ "active_members": users.where({ guild_id: model.id }).length });
        // let warHistoryTemplate = self.template(model.toJSON());
        // el.html(warHistoryTemplate);
        //     },
        //     // function onFailure() {
        //     //     console.log("fetched guild-collection with failure");
        //     // },
        // );
        return this;
    }
});

