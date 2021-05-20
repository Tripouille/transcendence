import { GuildView } from "./guildView";

export const GuildsView = Backbone.View.extend({

    className: "bloc",

    render: function() {
        this.collection.each(this.addGuildView, this);
        return this;
    },
    addGuildView: function(guild) {
        var guildView = new GuildView ({ model: guild });
        this.$el.append(guildView.render().el);
    }
});