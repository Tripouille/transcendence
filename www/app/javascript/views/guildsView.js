import { GuildView } from "./guildView";
import { GuildsCollection } from "../collections/guildsCollection"

export const GuildsView = Backbone.View.extend({

    render: function() {
        this.collection.each(this.addGuildView, this);
        return this;
    },

    addGuildView: function(guild) {
        var guildView = new GuildView ({ model: guild });
        this.$el.append(guildView.render().el);
    }
});