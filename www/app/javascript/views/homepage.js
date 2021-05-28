export const HomepageView = Backbone.View.extend({

    tagName: "div",

    template: _.template( $('#homepageTemplate').html()),

    render: function() {
        this.$el.html(this.template);
        return this;
    }
});