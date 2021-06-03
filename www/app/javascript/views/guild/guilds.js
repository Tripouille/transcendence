import { GuildRowView } from './guildRow';
import { GuildsCollection } from 'collections/guilds';

export const GuildsView = Backbone.View.extend({

    render: function (router) {
        let template = _.template($('#guildStaticContent').html());
        this.$el.html(template);
        $("#newguild").on("click", function () {
            router.navigate("#newguild", true, true);
        });

        let collection = new GuildsCollection();
        collection.fetch({
            success: function (collection, response, options) {
                collection.each(function (guild, i) {
                    guild.set({ "rank": i + 1 });
                    var guildRowView = new GuildRowView({ model: guild });
                    guildRowView.el.id = "guild" + guild.id;
                    $('#guildTableBody').append(guildRowView.render().el);
                    
                    var route = '#guild/' + guild.id;
                    $('#' + guildRowView.el.id).on("click", function () {
                        router.navigate(route, true, true);	/* #guild/1 */
    				});
                }, this);
            },
            error: function () {
                // console.log("fetched guild-collection with failure");
            }
        });
        return this;
    },
});
