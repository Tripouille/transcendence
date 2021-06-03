import { FiguresView } from 'views/guild/figures';
import { MembersView } from 'views/guild/members';
import { WarHistoryView } from 'views/guild/warhistory';
// import { WarSummaryView } from 'views/guild/warsummary';
// import { InvitesView } from 'views/guild/invites';

import { GuildsCollection } from 'collections/guilds';

export const GuildView = Backbone.View.extend({

    figuresView: new FiguresView(),
    membersView: new MembersView(),
    warHistoryView: new WarHistoryView(),
    // warSummaryView: new WarSummaryView(),
    // invitesView: new InvitesView(),

    mainButtonClick: function (evt) {
        let clicked = $(evt.target);
        if (clicked.text() == 'Join')
        {
            /* changer la base de donne de user pour avoir la guild id */
            $('#mainGuildButton span').attr('id', 'LeaveButton');
            $('#mainGuildButton span').text('Leave');
            $('#LeaveButton').on("click", this.mainButtonClick);
        }
        else if (clicked.text() == 'Leave')
        {
            /* changer la base de donne de user pour avoir la guild id */
            $('#mainGuildButton span').attr('id', 'JoinButton');
            $('#mainGuildButton span').text('Join');
            $('#JoinButton').on("click", this.mainButtonClick);
        }
        else if (clicked.text() == 'Destroy')
        {
            confirm("are you sure ?");
        }
    },

    addMainButton: function (guildId) {

        let joinButtonTemplate = _.template($('#mainGuildButtonTemplate').html());
        let buttonText;
        let self = this;
        if (window.currentUser.has("guild_id"))
        {
            // console.log(guildId);
            // console.log(typeof guildId);
            // console.log(parseInt(guildId));
            // console.log(typeof parseInt(guildId));
            // console.log(window.currentUser.attributes.guild_id);
            // console.log(typeof window.currentUser.attributes.guild_id);
            if (window.currentUser.attributes.guild_id != parseInt(guildId))
                return ;
            else if (window.currentUser.attributes.guild_id == parseInt(guildId))
            {
                console.log("from THIS guild")
                let guilds = new GuildsCollection();
                let guildsFetch = guilds.fetch();
    
                $.when(guildsFetch).done(function () {
                    let guild = guilds.findWhere({ id: parseInt(guildId) });
                    if (guild.owner == window.currentUser.attributes.username)
                        buttonText = "Destroy";
                    else
                        buttonText = "Leave";
                    console.log("creating button if fro mguild")
                    let model = new Backbone.Model({ name: buttonText, id: buttonText + 'Button' });
                    self.$el.append(joinButtonTemplate(model.toJSON()));
                    $('#' + buttonText + 'Button').on("click", self.mainButtonClick);
                });
            }
        }
        else
        {
            buttonText = "Join";
            let model = new Backbone.Model({ name: buttonText, id: buttonText + 'Button' });
            this.$el.append(joinButtonTemplate(model.toJSON()));
            $('#' + buttonText + 'Button').on("click", this.mainButtonClick);
        }
        // let model = new Backbone.Model({ name: buttonText, id: buttonText + 'Button' });
        // this.$el.append(joinButtonTemplate(model.toJSON()));
        // $('#' + buttonText + 'Button').on("click", this.mainButtonClick);
    },

    render: function(guildId) {
        
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