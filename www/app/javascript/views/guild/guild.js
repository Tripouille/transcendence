import { FiguresView } from 'views/guild/figures';
import { MembersView } from 'views/guild/members';
import { InvitesView } from 'views/guild/invites';

import { GuildModel } from 'models/guild';
import { InviteModel } from 'models/invite';

import { Users } from 'collections/users';
import { InvitesCollection } from '../../collections/invites';

export const GuildView = Backbone.View.extend({

    invitesView: new InvitesView(),
    figuresView: new FiguresView(),
    membersView: new MembersView(),
    guild: new GuildModel(),

    mainButtonClick: function (evt) {
        let self = evt.data.self;
        console.log(evt.target.id);
        if (evt.target.id == 'DestroyButton') {
            if (confirm("You are about to destroy this guild. Are you sure ?")) {
                self.guild.destroy({
                    success: function (model, response) {
                        console.log("seems like the guild is destroyed");
                        Backbone.history.navigate("guilds", { trigger: true });
                    },
                });
            }
            else
                $('#DestroyButton').one("click", { self: self }, self.mainButtonClick);
        }
        else if (evt.target.id == 'CancelInvitationButton') {
            let invites = new InvitesCollection();
            invites.fetch().done(function () {

                let model = invites.findWhere({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') });
                if (model) {
                    model.destroy({
                        success: function (model, response) {
                            console.log("Successfully destroyed invite");
                            self.render(self.guild.get('id'));
                        },
                    });
                }
                else
                    self.render(self.guild.get('id'));
            });
        }
        else if (evt.target.id == 'JoinButton') {
            window.currentUser.fetch().done(function () {
                let invite = new InviteModel();

                invite.save({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') }, {
                    success: function (model, resp, options) {
                        self.render(self.guild.get('id'));
                    },
                });
            });
        }
        else if (evt.target.id == 'LeaveButton') {
            window.currentUser.fetch().done(function () {
                window.currentUser.save({ 'guild_id': null }, {
                    success: function (model, resp, options) {
                        self.render(self.guild.get('id'));
                    },
                });
            });
        }
    },

    createUserList: function (users) {
        let self = this;
        let filteredCollection = new Users(users.where({ guild_id: parseInt(self.guild.id) }));
        let membersListTemplate = _.template($('#mainGuildMembersListTemplate').html());
        let membersListRowTemplate = _.template('<div class="button Ownership" id="<%= username %>"><%= username %></div>')

        $('#PassOwnershipButton').append(membersListTemplate);
        filteredCollection.each(function (user) {
            if (user.id != window.currentUser.id) {
                $('#mainGuildMembersList').append(membersListRowTemplate(user.toJSON()));
                $('#mainGuildMembersList div:last-child').on('click', function () {
                    self.guild.save({ 'owner_id': user.id }, {
                        success: function (model, resp, options) {
                            self.render(self.guild.get('id'));
                        },
                        error: function (model, resp, options) {
                            self.render(self.guild.get('id'));
                        },
                    });
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
    addMainButton: function (guildId, activeMembers) {

        let joinButtonTemplate = _.template($('#mainGuildButtonTemplate').html());
        let buttonText;

        this.guild.set("id", parseInt(guildId));
        let self = this;

        $.when(this.guild.fetch(), window.currentUser.fetch()/* Added in case of page reloading */).done(function () {

            if (window.currentUser.has("guild_id")) {
                if (window.currentUser.get("guild_id") != parseInt(guildId))
                    return;
                else if (window.currentUser.get("guild_id") == parseInt(guildId)) {
                    if (self.guild.get("owner_id") == window.currentUser.get("id")) {
                        if (activeMembers == 1)
                            buttonText = "Destroy";
                        else
                            buttonText = "Pass Ownership";
                    }
                    else
                        buttonText = "Leave";
                    let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
                    $('#guildName').append(joinButtonTemplate(model.toJSON()));
                    if (buttonText == "Pass Ownership") {
                        let users = new Users();
                        console.log("inside Pass Ownership");
                        users.fetch().done(function () {
                            self.createUserList(users);
                        });
                    }
                    else
                        $('#' + buttonText.replace(' ', '') + 'Button').one("click", { self: self }, self.mainButtonClick);
                }
            }
            else {
                let invites = new InvitesCollection();

                invites.fetch().done(function () {
                    buttonText = (invites.findWhere({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') })) ? "Cancel Invitation" : "Join";
                    let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
                    $('#guildName').append(joinButtonTemplate(model.toJSON()));
                    $('#' + buttonText.replace(' ', '') + 'Button').one("click", { self: self }, self.mainButtonClick);
                });
            }
        });
    },

    render: function (guildId) {
        /* ATTENTION PROBLEM this function is rendring 2 times when page refresh (router.js problem probably) */
        console.log("RENDER")
        this.$el.empty();
        let navbarTemplate = _.template($('#guildsNavbarTemplate').html());
        this.$el.prepend(navbarTemplate({ guild_id: guildId }));
        this.$el.append(this.invitesView.render(guildId, this).el);
        this.$el.append(this.figuresView.render(guildId, this).el);
        this.$el.append(this.membersView.render(guildId, this).el);
        return this;
    }
});
