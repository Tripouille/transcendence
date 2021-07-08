import { Guilds } from 'collections/guilds';

export const GuildsView = Backbone.View.extend({
    dynamicTemplate: _.template($('#guildRow').html()),
    guilds: new Guilds(),
    allRendered: false,
    page: 1,

    render: function () {
        this.$el.empty();
        this.$el.attr({ id: 'guildsAll' });
        this.allRendered = false;
        this.page = 1;
        let self = this;
        $('main#guildsAll').append('<div class="guildsTable"></div>')
        $.when(window.currentUser.fetch(), this.guilds.fetch()).done(function () {
            if (!window.currentUser.has('guild_id'))
                $('main#guildsAll').prepend(_.template($('#guildNewButton').html()));
            else {
                let myGuildModel = self.guilds.findWhere({ id: window.currentUser.get('guild_id') });
                $('main#guildsAll').prepend(self.dynamicTemplate(myGuildModel.toJSON()));

                $('div[data-href="#guilds/' + myGuildModel.id + '"]').one("click", function () {
                    Backbone.history.navigate('#guilds/' + myGuildModel.id, { trigger: true })
                });
            }
            while (($(window).height() >= $(document).height()) && !self.allRendered)
                self.renderPage();
            $(window).scroll(function () {
                if (($(window).scrollTop() + $(window).height() == $(document).height()) && !self.allRendered) {
                    self.renderPage();
                }
            });
        });
        return this;
    },
    renderPage: function () {
        let guildsPage = this.guilds.slice((this.page - 1) * 10, this.page * 10);

        if (!guildsPage.length)
            this.allRendered = true;
        else {
            const myGuildId = window.currentUser.get('guild_id');
            guildsPage.forEach(function (guild, i) {
                if (guild.id != myGuildId)
                    $('main#guildsAll .guildsTable').append(this.dynamicTemplate(guild.toJSON()));

                $('div[data-href="#guilds/' + guild.id + '"]').one("click", function () {
                    Backbone.history.navigate('#guilds/' + guild.id, { trigger: true })
                });
            }, this);
            $('#rank1').prepend('<img src="assets/gemstone-gold.svg" width="50" alt="gemstone gold">');
            $('#rank2').prepend('<img src="assets/gemstone-silver.svg" width="50" alt="gemstone silver">');
            $('#rank3').prepend('<img src="assets/gemstone-copper.svg" width="50" alt="gemstone copper">');
            this.page++;
        }
    }
});
