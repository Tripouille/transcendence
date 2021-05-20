import { GuildsCollection } from "../collections/guildsCollection";
import { GuildsView } from "./guildsView";

export const HeaderView = Backbone.View.extend({

    render: function() {
        this.setElement($('.button1'))
        var object = this.$el;
        // var object = $('#guilds');
        _.extend(object, Backbone.Events);

        // this.setElement($('#guilds'))
        // // this.$el.attr("content", "testing")
		// this.$el.text("TESGTING");
        return this;
    },
    events: {
        'click': function(msg) {
            console.log(msg);
            var t = msg.target.id;
            if (msg.target.id == "guilds")
            {
                // alert("Triggered " + msg + this);
                const $main = $('#main-bloc');
                console.log(t);

                var guilds = new GuildsCollection();
                guilds.fetch({
                    success: function(){
                        console.log("fetch with sucess");
                        console.log(guilds);
                        var guildsOverallView = new GuildsView({ collection: guilds });
                        $('#main-bloc').html(guildsOverallView.render().el);
                    },
                    error: function(){
                        console.log("fetch with failure");
                    }
                });
            }
        }
    }
});