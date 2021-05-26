export const MainView = Backbone.View.extend({

    template: _.template( $('#homepageTemplate').html()),

    render: function() {
        this.$el.html(this.template);
        return this;
    }
});