import { InvitesCollection } from "../../collections/invites";
import { Users } from "../../collections/users";

export const InvitesView = Backbone.View.extend({
    className: "guildInvites",

    staticTemplate: _.template($('#guildInvitesTemplate').html()),

    render: function(guildId, guildView) {
        this.$el.empty();

        if (window.currentUser.get('guild_id') != guildId)
            return this;

        let self = this;

        let users = new Users();
        let invites = new InvitesCollection();

        $.when(invites.fetch(), users.fetch()).done(function () {

            $(invites.where({ guild_id: parseInt(guildId) })).each(function (i, invite) {
                self.$el.html(self.staticTemplate);

                let dynamicTemplate = _.template($('#guildInviteRow').html());

                let cloneInvite = invite.clone();

                invite.set({
                    username: users.findWhere({ id: invite.get("user_id") }).get('username'),
                    mmr: 1200,
                    created_at: $.timeago(new Date(invite.get("created_at"))),
                    accept: "accept" + invite.id,
                    refuse: "refuse" + invite.id,
                });

                $('#guildInvitesBody').append(dynamicTemplate(invite.toJSON()));
            
                let data = { 
                    model: cloneInvite,
                    guildId: guildId,
                    guildView: guildView,
                    invitesView: self
                };
                $('#accept' + invite.id).one("click", data, cloneInvite.accept);
                $('#refuse' + invite.id).one("click", data, cloneInvite.refuse);
            });
        });
        return this;
    }
});