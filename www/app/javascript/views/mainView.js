export const MainView = Backbone.View.extend({

    template: _.template( $('#main-blocTemplate').html()),

    render: function() {
        $("#main-bloc").empty();
        $("#main-bloc").html(this.template);
        return this;
    }
});