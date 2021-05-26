import { GuildView } from './guildView';

export const GuildsView = Backbone.View.extend({

    addGuildView: function(guild, i) {
        guild.set({"rank": i + 1});
        var guildView = new GuildView ({ model: guild });
        this.$el.append(guildView.render().el);
    },

    render: function() {
        console.log(window.guildsCollection);
        window.currentUser.updateModel();
        window.guildsCollection.each(this.addGuildView, this);
        return this;
    },
});