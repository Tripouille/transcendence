const SelectModeView = Backbone.View.extend({
	template: _.template($('#selectModeTemplate').html()),

    render: function() {
        this.$el.html(this.template({}));
		this.$el.attr({id: 'selectMode'});
		return this;
	}
});

export default SelectModeView;