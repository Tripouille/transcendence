import { GuildsCollection } from 'collections/guilds';
import { Users } from 'collections/users';

export const GuildsView = Backbone.View.extend({
    dynamicTemplate: _.template($('#guildRow').html()),
    allRendered: false,
    page: 1,

    render: function () {
        this.allRendered = false;
        this.page = 1;
        let self = this;
        this.$el.empty();
        self.$el.append('<div class="guildsTable"></div>')
        /* A AMELIORER fetch user model de la guilde au lieu de toute la usersCollection */
        $.when(window.currentUser.fetch(), window.guilds.fetch(), window.users.fetch()).done(function () {

            window.guilds.each(function (guild, i) {
                guild.set({ "rank": i + 1 });
                guild.set({ "route": '#guilds/' + guild.id });
                guild.set({ "owner_name": window.users.findWhere({ id: guild.get('owner_id') }).get('username') });
                guild.set({ "my_guild": (guild.id == window.currentUser.get('guild_id')) ? true : false });
            });

            if (!window.currentUser.has('guild_id'))
                self.$el.prepend(_.template($('#guildNewButton').html()));
            else {
                let myGuildModel = window.guilds.findWhere({ id: window.currentUser.get('guild_id') });
                self.$el.prepend(self.dynamicTemplate(myGuildModel.toJSON()));
                
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
        let guildsPage = window.guilds.slice((this.page - 1) * 10, this.page * 10);
        let self = this;

        if (!guildsPage.length)
            self.allRendered = true;
        else {
            let $guildsTable = $('.guildsTable');
            const myGuildId = window.currentUser.get('guild_id');
            guildsPage.forEach(function (guild, i) {
                if (guild.id != myGuildId)
                    $guildsTable.append(self.dynamicTemplate(guild.toJSON()));
        
                $('div[data-href="#guilds/' + guild.id + '"]').one("click", function () {
                    Backbone.history.navigate('#guilds/' + guild.id, { trigger: true })
                });
            });
            $('#rank1').prepend('<img src="assets/gemstone-gold.svg" width="50" alt="gemstone gold">');
            $('#rank2').prepend('<img src="assets/gemstone-silver.svg" width="50" alt="gemstone silver">');
            $('#rank3').prepend('<img src="assets/gemstone-copper.svg" width="50" alt="gemstone copper">');
            self.page++;
        }
    }
});
