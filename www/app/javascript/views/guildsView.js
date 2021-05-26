import { GuildView } from './guildView';

export const GuildsView = Backbone.View.extend({

    addGuildView: function(guild, i) {
        guild.set({"rank": i + 1});
        var guildView = new GuildView ({ model: guild });
        $('#guildTableBody').append(guildView.render().el);
    },

    renderForm: function(templateName) {
        // let template = _.template($('#guildStaticContent').html());
        let template = _.template($(templateName).html());
        this.$el.html(template);
        // window.currentUser.updateModel();
        // window.guildsCollection.each(this.addGuildView, this);
        return this;
    },

    render: function() {
        let template = _.template($('#guildStaticContent').html());
        this.$el.html(template);
        window.currentUser.updateModel();
        window.guildsCollection.each(this.addGuildView, this);
        return this;
    },
});