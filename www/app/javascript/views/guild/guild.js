import { FiguresView } from 'views/guild/figures';
import { MembersView } from 'views/guild/members';
import { WarHistoryView } from 'views/guild/warhistory';
// import { WarSummaryView } from 'views/guild/warsummary';
// import { InvitesView } from 'views/guild/invites';

import { GuildsCollection } from 'collections/guilds';

import { GuildModel } from 'models/guild';

export const GuildView = Backbone.View.extend({

    figuresView: new FiguresView(),
    membersView: new MembersView(),
    warHistoryView: new WarHistoryView(),
    // warSummaryView: new WarSummaryView(),
    // invitesView: new InvitesView(),
    guild: new GuildModel(),

    mainButtonClick: function (evt) {
        let clicked = $(evt.target);
        let self = evt.data.self;

        if (clicked.text() == 'Destroy')
        {
            confirm("You are about to destroy this guild. Are you sure ?");
            self.guild.destroy({
                success: function(model, response) {
                    console.log("seems like the guild is destroyed");
                    Backbone.history.navigate("guilds", { trigger: true });
                },
            });
        }
        else
        {
            window.currentUser.fetch().done(function() {
                let value = (clicked.text() == 'Join') ? self.guild.get('id') : null;
                window.currentUser.save({ 'guild_id': value }, {
                    success: function (userModel, resp, options) {
                        $('#' + (clicked.text() == 'Join' ? 'Leave' : 'Join')  + 'Button').off("click", self.mainButtonClick);
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

            if (window.currentUser.has("guild_id"))
            {
                if (window.currentUser.get("guild_id") != parseInt(guildId))
                    return ;
                else if (window.currentUser.get("guild_id") == parseInt(guildId))
                {    
                    buttonText = (self.guild.get("owner_id") == window.currentUser.get("id")) ? "Destroy" : "Leave";

                    let model = new Backbone.Model({ name: buttonText, id: buttonText + 'Button' });
                    self.$el.append(joinButtonTemplate(model.toJSON()));
                    $('#' + buttonText + 'Button').on("click", { self: self }, self.mainButtonClick);
                }
            }
            else
            {
                buttonText = "Join";
                let model = new Backbone.Model({ name: buttonText, id: buttonText + 'Button' });
                self.$el.append(joinButtonTemplate(model.toJSON()));
                $('#' + buttonText + 'Button').on("click", { self: self }, self.mainButtonClick);
            }
        });
    },

    render: function(guildId) {

        console.log("RENDER")
        this.$el.html(this.figuresView.render(guildId).el);
        this.addMainButton(guildId);
        
        this.$el.append(this.membersView.render(guildId).el);
        this.$el.append(this.warHistoryView.render(guildId).el);


        // if (guild = atWar)
        //     this.$el.append(this.warSummaryView.render(guildId).el);

        /* to implement */
        // if (user = notinguild)
        //     this.$el.append(this.joinGuildView.render(guildId).el);

        // if (user = administrator)
        //     this.$el.append(this.invitesView.render(guildId).el);
        return this;
    }
});