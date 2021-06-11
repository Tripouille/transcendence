import { Users } from 'collections/users';
import { GuildView } from './guild';
import { GuildModel } from 'models/guild';

export const MembersView = Backbone.View.extend({
    className: "guildMembers",

    template: _.template($('#guildMembersTemplate').html()),

    render: function(guildId) {
        this.$el.empty();
        this.$el.html(this.template);
        let self = this;

        let users = new Users();
        let guild = new GuildModel({ id: guildId });

        $.when(users.fetch(), guild.fetch()).done(function () {

            var filteredCollection = new Users(users.where({ guild_id: parseInt(guildId) }));

            filteredCollection.each(function (user) {
                /* en static pour l'instant, a reflechir a dynamiser ca */
                user.set({ "rank": ((user.id == guild.get("owner_id")) ? "Owner" : "Officer") });
                user.set({ "mmr": 1200 });
                user.set({ "contribution": 0 });
                
                let template = _.template($('#guildMemberRowTemplate').html());
                let filledTempalte = template(user.toJSON());
                $("#guildMembersBody").append(filledTempalte);

                if (window.currentUser.id == guild.get("owner_id") && user.id != window.currentUser.id)
                {
                    user.set({ "kick": "kick" + user.id });
                    let kickTemplate = _.template($('#guildKickMemberTableData').html());
                    $("#guildMembersBody tr:last-child").append(kickTemplate(user.toJSON()));
                    
                    let data = { 
                        model: user,
                        guildId: guildId,
                        membersView: self,
                    };

                    $('#kick' + user.id).one("click", data, user.kick);
                }

            });
            // function onFailure() {
            //     console.log("fetched guild-collection with failure");
            },
        );
        return this;
    }
});