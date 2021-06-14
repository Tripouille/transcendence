import { FiguresView } from 'views/guild/figures';
import { MembersView } from 'views/guild/members';
import { WarHistoryView } from 'views/guild/warhistory';
// import { WarSummaryView } from 'views/guild/warsummary';
import { InvitesView } from 'views/guild/invites';

import { GuildModel } from 'models/guild';
import { InviteModel } from 'models/invite';

import { GuildsCollection } from 'collections/guilds';
import { InvitesCollection } from '../../collections/invites';

export const GuildView = Backbone.View.extend({

    figuresView: new FiguresView(),
    membersView: new MembersView(),
    warHistoryView: new WarHistoryView(),
    // warSummaryView: new WarSummaryView(),
    invitesView: new InvitesView(),
    guild: new GuildModel(),

    mainButtonClick: function (evt) {
        let clicked = $(evt.target);
        let self = evt.data.self;

        if (clicked.text() == 'Destroy') {
            confirm("You are about to destroy this guild. Are you sure ?");
            self.guild.destroy({
                success: function (model, response) {
                    console.log("seems like the guild is destroyed");
                    $('#DestroyButton').off("click", self.mainButtonClick);
                    Backbone.history.navigate("guilds", { trigger: true });
                },
            });
        }
        else if (clicked.text() == 'Cancel Invitation') {
            let invites = new InvitesCollection();
            invites.fetch().done(function () {

                let model = invites.findWhere({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') });
                if (model) {
                    model.destroy({
                        success: function (model, response) {
                            console.log("Successfully destroyed invite");
                            $('#CancelInvitationButton').off("click", self.mainButtonClick);
                            self.render(self.guild.get('id'));
                        },
                    });
                }
                else
                    self.render(self.guild.get('id'));
            });
        }
        else if (clicked.text() == 'Join') {
            window.currentUser.fetch().done(function () {
                let invite = new InviteModel();

                invite.save({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') }, {
                    success: function (model, resp, options) {
                        $('#JoinButton').off("click", self.mainButtonClick);
                        self.render(self.guild.get('id'));
                    },
                });
            });
        }
        else if (clicked.text() == 'Leave') {
            window.currentUser.fetch().done(function () {
                window.currentUser.save({ 'guild_id': null }, {
                    success: function (model, resp, options) {
                        $('#LeaveButton').off("click", self.mainButtonClick);
                        self.render(self.guild.get('id'));
                    },
                });
            });
        }
    },

    addMainButton: function (guildId) {

        let joinButtonTemplate = _.template($('#mainGuildButtonTemplate').html());
        let buttonText;

        this.guild.set("id", parseInt(guildId));
        let self = this;

        $.when(this.guild.fetch()).done(function () {

            if (window.currentUser.has("guild_id")) {
                if (window.currentUser.get("guild_id") != parseInt(guildId))
                    return;
                else if (window.currentUser.get("guild_id") == parseInt(guildId)) {
                    buttonText = (self.guild.get("owner_id") == window.currentUser.get("id")) ? "Destroy" : "Leave";

                    let model = new Backbone.Model({ name: buttonText, id: buttonText + 'Button' });
                    $('#guildName').append(joinButtonTemplate(model.toJSON()));
                    $('#' + buttonText + 'Button').on("click", { self: self }, self.mainButtonClick);
                }
            }
            else {
                let invites = new InvitesCollection();

                invites.fetch().done(function () {

                    buttonText = (invites.findWhere({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') })) ? "Cancel Invitation" : "Join";
                    let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
                    $('#guildName').append(joinButtonTemplate(model.toJSON()));
                    $('#' + buttonText.replace(' ', '') + 'Button').on("click", { self: self }, self.mainButtonClick);
                });
            }
        });
    },

    render: function (guildId) {

        console.log("RENDER")
        this.$el.empty();
        this.$el.html(this.invitesView.render(guildId, this).el);
        this.$el.append(this.figuresView.render(guildId).el);
        this.addMainButton(guildId);

        this.$el.append(this.membersView.render(guildId).el);
        this.$el.append(this.warHistoryView.render(guildId).el);


        // if (guild = atWar)
        //     this.$el.append(this.warSummaryView.render(guildId).el);

        /* to implement */
        // if (user = notinguild)
        //     this.$el.append(this.joinGuildView.render(guildId).el);

        return this;
    }
});
