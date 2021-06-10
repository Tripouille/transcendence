import { Users } from 'collections/users';

export const MembersView = Backbone.View.extend({
    className: "guildMembers",

    template: _.template($('#guildMembersTemplate').html()),

    render: function(guildId) {
        this.$el.empty();
        this.$el.html(this.template);

        let users = new Users();
		let usersFetch = users.fetch();

        $.when(usersFetch).done(function () {
            var filteredCollection = new Users(users.where({ guild_id: parseInt(guildId) }));

            filteredCollection.each(function (user) {
                /* en static pour l'instant, a reflechir a dynamiser ca */
                user.set({ "rank": "noRank-atm" });
                user.set({ "mmr": 1200 });
                user.set({ "contribution": 0 });

                let template = _.template( $('#guildMemberRow').html());
                $("#guildMembersBody").append(template(user.toJSON()));
            });
            // function onFailure() {
            //     console.log("fetched guild-collection with failure");
            },
        );
        return this;
    }
});