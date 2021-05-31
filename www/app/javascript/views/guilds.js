import { GuildRowView } from './guildRow';
import { GuildsCollection } from 'collections/guilds';

export const GuildsView = Backbone.View.extend({

    render: function () {
        let template = _.template($('#guildStaticContent').html());
        this.$el.html(template);

        let collection = new GuildsCollection();
        collection.fetch({
            success: function (collection, response, options) {
                // console.log("fetched guild-collection with sucess");
                collection.each(function (guild, i) {
                    guild.set({ "rank": i + 1 });
                    var guildRowView = new GuildRowView({ model: guild });
                    $('#guildTableBody').append(guildRowView.render().el);
                }, this);
            },
            error: function () {
                // console.log("fetched guild-collection with failure");
            }
        });
        return this;
    },
});
