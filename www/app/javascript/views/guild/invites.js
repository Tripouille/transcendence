import { InvitesCollection } from "../../collections/invites";
import { Users } from "../../collections/users";

export const InvitesView = Backbone.View.extend({
    className: "guildInvites",

    staticTemplate: _.template($('#guildInvitesTemplate').html()),

    render: function (guildId, guildView) {
        this.$el.empty();
        let self = this;

        window.currentUser.fetch().done(function () {
            if (window.currentUser.get('guild_id') != guildId) /* Previous condition wasn't working on page reload added fetch so we get current user info */
                return this;

            let users = new Users();
            let invites = new InvitesCollection();

            $.when(invites.fetch(), users.fetch()).done(function () {
                let filteredInvites = invites.where({ guild_id: parseInt(guildId) });

                if (filteredInvites.length != 0) { /* fixed previous condition wasn't working, if nothing found gives an array of length 0 and not a null array */
                    let dynamicTemplate = _.template($('#guildInviteRow').html());

                    self.$el.html(self.staticTemplate);
                    $(filteredInvites).each(function (i, invite) {
                        invite.set({
                            username: users.findWhere({ id: invite.get("user_id") }).get('username'),
                            mmr: 1200,
                            created_at: $.timeago(new Date(invite.get("created_at"))),
                            accept: "accept" + invite.id,
                            refuse: "refuse" + invite.id,
                        });
                        $('#guildInvitesBody').append(dynamicTemplate(invite.toJSON()));

                        let data = {
                            model: invite,
                            guildId: guildId,
                            guildView: guildView,
                            invitesView: self
                        };

                        $('#accept' + invite.id).one("click", data, invite.accept);
                        $('#refuse' + invite.id).one("click", data, invite.refuse);
                    });
                }
            });
        });
        return this;
    }
});
