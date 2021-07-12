const RulesView = Backbone.View.extend({
	template: _.template($('#rulesTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'rules'});
		return this;
	}
});

export default RulesView;