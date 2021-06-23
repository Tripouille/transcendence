import { FiguresView } from 'views/guild/figures';
import { MembersView } from 'views/guild/members';
import { InvitesView } from 'views/guild/invites';

import { InviteModel } from 'models/invite';

export const GuildView = Backbone.View.extend({

    invitesView: new InvitesView(),
    figuresView: new FiguresView(),
    membersView: new MembersView(),
    guildId: 0,

    mainButtonClick: function (evt) {
        let thisView = evt.data.thisView;
        console.log(evt.target.id);
        if (evt.target.id == 'DestroyButton') {
            if (confirm("You are about to destroy this guild. Are you sure ?")) {
                window.guilds.findWhere({ id: thisView.guildId }).destroy({
                    success: function (model, response) {
                        console.log("seems like the guild is destroyed");
                        Backbone.history.navigate("guilds", { trigger: true });
                    },
                });
            }
            else
                $('#DestroyButton').one("click", { thisView: thisView }, thisView.mainButtonClick);
        }
        else if (evt.target.id == 'CancelInvitationButton') {
            let model = window.invites.findWhere({ user_id: window.currentUser.id, guild_id: thisView.guildId });
            if (model) {
                model.destroy({
                    success: function (model, response) {
                        console.log("Successfully destroyed invite");
                        thisView.render(thisView.guildId);
                    }
                });
            }
            else
                Backbone.history.navigate('#guilds', { trigger: true });
        }
        else if (evt.target.id == 'JoinButton') {
            let invite = new InviteModel();

            invite.save({ user_id: window.currentUser.id, guild_id: thisView.guildId }, {
                success: function (model, resp, options) {
                    thisView.render(thisView.guildId);
                },
            });
        }
        else if (evt.target.id == 'LeaveButton') {
            if (confirm("You are about to leave this guild. Are you sure ?")) {
                window.currentUser.save({ 'guild_id': null }, {
                    success: function (model, resp, options) {
                        thisView.render(thisView.guildId);
                    },
                });
            }
            else
                $('#LeaveButton').one("click", { thisView: thisView }, thisView.mainButtonClick);
        }
    },

    createUserList: function () {
        let self = this;
        let filteredCollection = window.users.where({ guild_id: this.guildId });

        let membersListTemplate = _.template($('#mainGuildMembersListTemplate').html());
        let membersListRowTemplate = _.template('<div class="button Ownership" id="<%= username %>"><%= username %></div>')

        $('#PassOwnershipButton').append(membersListTemplate);

        filteredCollection.forEach(function (user, id) {
            if (user.id != window.currentUser.id) {
                $('#mainGuildMembersList').append(membersListRowTemplate(user.toJSON()));
                $('#mainGuildMembersList div:last-child').on('click', function () {
                    if (confirm("You are about to pass ownership to " + user.get('username') + ". Are you sure ?")) {
                        window.guilds.findWhere({ id: self.guildId }).save({ 'owner_id': user.id }, {
                            success: function (model, resp, options) {
                                self.render(self.guildId);
                            },
                            error: function (model, resp, options) {
                                self.render(self.guildId);
                            },
                        });
                    }
                });
            }
        });
        $('#mainGuildMembersList').css('display', 'none');
        $('#PassOwnershipButton').hover(
            function () {
                $('#mainGuildMembersList').css('display', 'block');
            },
            function () {
                $('#mainGuildMembersList').css('display', 'none');
            }
        );
    },

    addMainButton: function (activeMembers) {

        let joinButtonTemplate = _.template($('#mainGuildButtonTemplate').html());
        let buttonText;

        if (window.currentUser.has("guild_id"))
        {
            if (window.currentUser.get("guild_id") != this.guildId)
                return ;
            else if (window.currentUser.get("guild_id") == this.guildId)
            {
                if (window.guilds.findWhere({ id: this.guildId }).get("owner_id") == window.currentUser.id)
                {
                    if (activeMembers == 1)
                        buttonText = "Destroy";
                    else
                        buttonText = "Pass Ownership";
                }
                else
                    buttonText = "Leave";
                let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
                $('#guildNavbar').append(joinButtonTemplate(model.toJSON()));
                if (buttonText == "Pass Ownership") {
                    this.createUserList(this.guildId);
                }
                else
                    $('#' + buttonText.replace(' ', '') + 'Button').one("click", { thisView: this }, this.mainButtonClick);
            }
        }
        else {
            buttonText = (window.invites.findWhere({ user_id: window.currentUser.id, guild_id: this.guildId })) ? "Cancel Invitation" : "Join";
            let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
            $('#guildNavbar').append(joinButtonTemplate(model.toJSON()));
            $('#' + buttonText.replace(' ', '') + 'Button').one("click", { thisView: this }, this.mainButtonClick);
        }
    },

    render: function (guildId) {
        this.guildId = guildId;
        this.$el.empty();
        let self = this;

        $.when(window.guilds.fetch(), window.currentUser.fetch(), window.users.fetch(), window.invites.fetch()).then(
            function success() {
                self.$el.prepend('<div id="guildNavbar"><a class="button Cancel" href="#guilds">Back</a></div>');
                self.addMainButton(window.users.where({ guild_id: guildId }).length);
                if (window.currentUser.get('guild_id') == guildId)
                    self.$el.append(self.invitesView.render(guildId, self).el);
                self.$el.append(self.figuresView.render(guildId).el);
                self.$el.append(self.membersView.render(guildId, self).el);
            },
            function error() {
                console.log("Caught an error while fetching the database, rendering back to guilds");
                Backbone.history.navigate("guilds", { trigger: true });
            }
        );
        return this;
    }
});
