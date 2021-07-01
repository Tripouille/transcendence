import { Users } from '../collections/users';

export const UsersView = Backbone.View.extend({
    dynamicTemplate: _.template($('#userRow').html()),
    users: new Users(),
    allRendered: false,
    page: 1,

    render: function () {
        this.$el.empty();
        this.$el.attr({ id: 'guilds' });
        this.allRendered = false;
        this.page = 1;
        let self = this;
        self.$el.append('<div class="usersTable"></div>')
        $.when(window.currentUser.fetch(), this.users.fetch()).done(function () {
            let myUserModel = self.users.findWhere({ id: window.currentUser.id });
            self.$el.prepend(self.dynamicTemplate(myUserModel.toJSON()));

            $('div[data-href="#users/' + myUserModel.id + '"]').one("click", function () {
                Backbone.history.navigate('#users/' + myUserModel.id, { trigger: true })
            });

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
        let usersPage = this.users.slice((this.page - 1) * 10, this.page * 10);

        if (!usersPage.length)
            this.allRendered = true;
        else {
            let $usersTable = $('.usersTable');
            const myUserId = window.currentUser.id;
            usersPage.forEach(function (user, i) {
                if (user.id != myUserId)
                    $usersTable.append(this.dynamicTemplate(user.toJSON()));

                $('div[data-href="#users/' + user.id + '"]').one("click", function () {
                    Backbone.history.navigate('#users/' + user.id, { trigger: true })
                });
            }, this);
            $('#rank1').prepend('<img src="assets/gemstone-gold.svg" width="50" alt="gemstone gold">');
            $('#rank2').prepend('<img src="assets/gemstone-silver.svg" width="50" alt="gemstone silver">');
            $('#rank3').prepend('<img src="assets/gemstone-copper.svg" width="50" alt="gemstone copper">');
            this.page++;
        }
    }
});
