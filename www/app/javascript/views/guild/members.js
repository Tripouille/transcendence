export const MembersView = Backbone.View.extend({
    className: "guildMembers",
    template: _.template($('#guildMembersTemplate').html()),
    rowTemplate: _.template($('#guildMemberRowTemplate').html()),
    kickTemplate: _.template($('#guildKickMemberTableData').html()),

    render: function (guildId, guildView) {
        this.$el.empty();
        let self = this;
        let guild_owner_id = window.guilds.findWhere({ id: guildId }).get("owner_id");
        let filteredCollection = window.users.where({ guild_id: guildId });
        if (filteredCollection)
        {
            this.$el.html(this.template).ready(function () {
                filteredCollection.forEach(function (user) {
                    user.set({ "rank": ((user.id == guild_owner_id) ? "Owner" : "Officer") });
                    user.set({ "mmr": 1200 }); /* to code */
                    user.set({ "contribution": 0 }); /* to code */
                    $("#guildMembersBody").append(self.rowTemplate(user.toJSON()));
                    if (window.currentUser.id == guild_owner_id && user.id != window.currentUser.id)
                    {
                        user.set({ "kick": "kick" + user.id });
    
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
