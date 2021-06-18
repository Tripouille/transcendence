import { GuildsCollection } from 'collections/guilds';
import { Users } from 'collections/users';

export const GuildsView = Backbone.View.extend({
    guildsCollection: new GuildsCollection(),
    usersCollection: new Users(),
    dynamicTemplate: _.template($('#guildRow').html()),
    allRendered: false,
    page: 1,

    render: function () {
        this.allRendered = false;
        this.page = 1;
        let self = this;
        self.$el.append('<div class="guildsTable"></div>')
        /* A AMELIORER fetch user model de la guilde au lieu de toute la usersCollection */
        $.when(window.currentUser.fetch(), self.guildsCollection.fetch(), self.usersCollection.fetch()).done(function () {

            self.guildsCollection.each(function (guild, i) {
                guild.set({ "rank": i + 1 });
                guild.set({ "route": '#guilds/' + guild.id });
                guild.set({ "owner_name": self.usersCollection.findWhere({ id: guild.get('owner_id') }).get('username') });
                guild.set({ "my_guild": (guild.id == window.currentUser.get('guild_id')) ? true : false });
            });
            if (!window.currentUser.has('guild_id'))
                self.$el.prepend(_.template($('#guildNewButton').html()));
            else {
                let myGuildModel = self.guildsCollection.findWhere({ id: window.currentUser.get('guild_id') });
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
        let guildsPage = this.guildsCollection.slice((this.page - 1) * 10, this.page * 10);
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
            self.page++;
        }
    }
});
