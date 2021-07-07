import { Users } from 'collections/users';

export const MembersView = Backbone.View.extend({
    className: "guildMembers",
    template: _.template($('#guildMembersTemplate').html()),
    rowTemplate: _.template($('#guildMemberRowTemplate').html()),
    kickTemplate: _.template($('#guildKickMemberTableData').html()),

    render: function (guildView) {
        this.$el.empty();
        let self = this;

        let filteredCollection = new Users(guildView.guild.get('users'));

        if (filteredCollection) {
            this.$el.html(this.template).ready(function () {
                filteredCollection.forEach(function (user) {
                    $("#guildMembersBody").append(self.rowTemplate(user.toJSON()));

                    if (window.currentUser.id == guildView.guild.get('owner_id') && user.id != window.currentUser.id) {
                        user.set({ kick: "kick" + user.id });

                        $('#guildMembersBody div[class="guildMemberRow"]:last-child').append(self.kickTemplate(user.toJSON()));
                        let data = {
                            model: user,
                            guildView: guildView,
                        };
                        $('#kick' + user.id).one("click", data, user.kick);
                    }
                    else
                        $("#guildMembersBody div:last-child").append('<div class="kickButton"></div>');
                });
            });
        }
        else
            Backbone.history.navigate('#guilds', { trigger: true });
        return this;
    }
});
