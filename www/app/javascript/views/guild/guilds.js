import { GuildsCollection } from 'collections/guilds';
import { User } from 'models/user';

export const GuildsView = Backbone.View.extend({

    render: function () {
        let self = this;
        window.currentUser.fetch().done(function () {
            if (!window.currentUser.has('guild_id'))
                self.$el.prepend(_.template($('#guildNewButton').html()));
            let collection = new GuildsCollection();
            collection.fetch({
                success: function (collection, response, options) {
                    collection.each(function (guild, i) {
                        guild.set({ "rank": i + 1 });
                        guild.set({ "route": '#guilds/' + guild.id });
                        let userModel = new User({ id: guild.get('owner_id') });
                        userModel.fetch().done(function () {
                            guild.set({ "owner_name": userModel.get('username') });
                            let dynamicTemplate = _.template($('#guildRow').html());
                            guild.set({ "my_guild": (guild.id == window.currentUser.get('guild_id')) ? true : false });
                            self.$el.append(dynamicTemplate(guild.toJSON()));
                            $('div[data-href="#guilds/' + guild.id + '"]').on("click", function () {
                                Backbone.history.navigate('#guilds/' + guild.id, { trigger: true })
                            });
                        });
                    });
                },
                error: function () {
                    // console.log("fetched guild-collection with failure");
                }
            });
            return this;
        });
    },
});
