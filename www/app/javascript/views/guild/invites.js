import { Invites } from "../../collections/invites";

export const InvitesView = Backbone.View.extend({
    className: "guildInvites",
    staticTemplate: _.template($('#guildInvitesTemplate').html()),

    render: function (guildView) {
        this.$el.empty();

        let filteredInvites = new Invites(guildView.guild.get('invites'));

        if (filteredInvites.length != 0) {
            let dynamicTemplate = _.template($('#guildInviteRow').html());
            this.$el.html(this.staticTemplate).ready(function () {
                filteredInvites.forEach(function (invite) {
                    invite.set({
                        created_at: $.timeago(new Date(invite.get("created_at"))),
                        accept: "accept" + invite.id,
                        refuse: "refuse" + invite.id,
                    });
                    $('#guildInvitesBody').append(dynamicTemplate(invite.toJSON()));
                    let data = {
                        model: invite,
                        guildView: guildView,
                    };
                    $('#accept' + invite.id).one("click", data, invite.accept);
                    $('#refuse' + invite.id).one("click", data, invite.refuse);
                });
            });
        }
        return this;
    }
});
