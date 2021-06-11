import { GuildsCollection } from 'collections/guilds';

export const GuildsView = Backbone.View.extend({

    render: function () {
        let template = _.template($('#guildStaticContent').html());
        this.$el.html(template);
        let self = this;
        window.currentUser.fetch().done(function () {

            if (!window.currentUser.has('guild_id'))
                self.$el.prepend(_.template($('#guildNewButton').html()));
            else
                self.$el.prepend(_.template($('#myGuildStaticContent').html()));

            let collection = new GuildsCollection();
            collection.fetch({
                success: function (collection, response, options) {
                    collection.each(function (guild, i) {
                        guild.set({ "rank": i + 1 });
                        guild.set({ "route": '#guilds/' + guild.id });

                        let dynamicTemplate = _.template( $('#guildRow').html());

                        if (guild.get('id') == window.currentUser.get('guild_id'))
                            $('#myGuildTableBody').append(dynamicTemplate(guild.toJSON()));
                        else
                            $('#guildTableBody').append(dynamicTemplate(guild.toJSON()));

                    });
                    
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
