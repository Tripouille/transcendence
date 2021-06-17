import { GuildsCollection } from 'collections/guilds';
import { Users } from 'collections/users';

export const GuildsView = Backbone.View.extend({

    render: function () {
        let self = this;
        let guildsCollection = new GuildsCollection();
        let usersCollection = new Users();
        self.$el.append('<div class="guildsTable"></div>')
        let $guildsTable = $('.guildsTable');
        $.when(window.currentUser.fetch(), guildsCollection.fetch(), usersCollection.fetch()).done(function () {
            let dynamicTemplate = _.template($('#guildRow').html());

            if (!window.currentUser.has('guild_id'))
                self.$el.prepend(_.template($('#guildNewButton').html()));
            guildsCollection.each(function (guild, i) {
                guild.set({ "rank": i + 1 });
                guild.set({ "route": '#guilds/' + guild.id });
                guild.set({ "owner_name": usersCollection.findWhere({ id: guild.get('owner_id') }).get('username') });
                if (guild.id == window.currentUser.get('guild_id')) {
                    guild.set({ "my_guild": true });
                    self.$el.prepend(dynamicTemplate(guild.toJSON()));
                }
                else {
                    guild.set({ "my_guild": false });
                    $guildsTable.append(dynamicTemplate(guild.toJSON()));
                }
                $('div[data-href="#guilds/' + guild.id + '"]').on("click", function () {
                    Backbone.history.navigate('#guilds/' + guild.id, { trigger: true })
                });
            });
        });
        return this;
    }
});
