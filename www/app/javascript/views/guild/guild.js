import { FiguresView } from 'views/guild/figures';
import { MembersView } from 'views/guild/members';
import { InvitesView } from 'views/guild/invites';

import { GuildModel } from 'models/guild';
import { InviteModel } from 'models/invite';

import { InvitesCollection } from '../../collections/invites';

export const GuildView = Backbone.View.extend({

    invitesView: new InvitesView(),
    figuresView: new FiguresView(),
    membersView: new MembersView(),
    guild: new GuildModel(),

    mainButtonClick: function (evt) {
        let clicked = $(evt.target);
        let self = evt.data.self;

        if (clicked.text() == 'Destroy') {
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
        else if (clicked.text() == 'Cancel Invitation') {
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
        else if (clicked.text() == 'Join') {
            window.currentUser.fetch().done(function () {
                let invite = new InviteModel();

                invite.save({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') }, {
                    success: function (model, resp, options) {
                        self.render(self.guild.get('id'));
                    },
                });
            });
        }
        else if (clicked.text() == 'Leave') {
            window.currentUser.fetch().done(function () {
                window.currentUser.save({ 'guild_id': null }, {
                    success: function (model, resp, options) {
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

        $.when(this.guild.fetch(), window.currentUser.fetch()/* Added in case of page reloading */).done(function () {

            if (window.currentUser.has("guild_id")) {
                if (window.currentUser.get("guild_id") != parseInt(guildId))
                    return;
                else if (window.currentUser.get("guild_id") == parseInt(guildId)) {
                    buttonText = (self.guild.get("owner_id") == window.currentUser.get("id")) ? "Destroy" : "Leave";

                    let model = new Backbone.Model({ name: buttonText, id: buttonText + 'Button' });
                    $('#guildName').append(joinButtonTemplate(model.toJSON()));
                    $('#' + buttonText + 'Button').one("click", { self: self }, self.mainButtonClick);
                }
            }
            else {
                let invites = new InvitesCollection();

                invites.fetch().done(function () {

                    buttonText = (invites.findWhere({ user_id: window.currentUser.get('id'), guild_id: self.guild.get('id') })) ? "Cancel Invitation" : "Join";
                    let model = new Backbone.Model({ name: buttonText, id: buttonText.replace(' ', '') + 'Button' });
                    $('#guildName').append(joinButtonTemplate(model.toJSON()));
                    console.log("Button appending")
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
        this.$el.append(this.membersView.render(guildId).el);
        return this;
    }
});
