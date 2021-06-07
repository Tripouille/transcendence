import { GuildRowView } from './guildRow';
import { GuildsCollection } from 'collections/guilds';

export const GuildsView = Backbone.View.extend({

    render: function () {
        let template = _.template($('#guildStaticContent').html());
        this.$el.html(template);
        let self = this;
        window.currentUser.fetch().done(function () {
            if (window.currentUser.get('guild_id') === null)
                self.$el.prepend(_.template($('#guildNewButton').html()));
            else {
                self.$el.prepend(_.template($('#myGuildStaticContent').html()));
            }

            let collection = new GuildsCollection();
            collection.fetch({
                success: function (collection, response, options) {
                    collection.each(function (guild, i) {
                        guild.set({ "rank": i + 1 });
                        var guildRowView = new GuildRowView({ model: guild });

                        var route = '#guilds/' + guild.id;
                        guildRowView.$el.attr('data-href', route)

                        // guild.set({ "route": route })
                        // guildRowView.el.id = "guild" + guild.id;
                        if (guild.get('id') == window.currentUser.get('guild_id'))
                            $('#myGuildTableBody').append(guildRowView.render().el);
                        else
                            $('#guildTableBody').append(guildRowView.render().el);
                    }, this);
                    $('tr[data-href]').on("click", function (evt) {
                        Backbone.history.navigate($(evt.currentTarget).data('href'), true, true);
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
