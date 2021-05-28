import { GuildModel } from '../models/guildModel';

export const GuildNewView = Backbone.View.extend({
	initialize: function () {
		this.model = new GuildModel();

		// this.model.on('invalid', this.onModelInvalid, this);
	},

	events: {
		'click #formSubmitNewGuild': 'onFormSubmit',
		'change input[type!="submit"]': 'onInputChange',
		// 'blur input[type!="submit"]': 'onInputChange',
		// 'focus input': function (e) {
		// this.resetInputErrors(e.target);
		// }
	},

	templates: {
		'error': _.template('<span class="error"><%=error%></span>')
	},

	onFormSubmit: function (e) {
		// get data from form on submit button
		// var model = this.model;

		e.preventDefault();

		this.$el.find('input[name]').each(function () {
			this.model.set(this.name, this.value);
		});
		this.model.set('owner', window.currentUser.name);
		this.model.save();

		// var result = $('#newguildform').serializeArray();
		// console.log(result);
		// if (result !== true) {
		// 	console.log("form unvalidated")
		// 	this.showInputErrors(result);
		// }
		// else {
		// 	console.log("form validated")
		// 	this.model.save(result);
		$("#guildspage").trigger("click")
	},

	render: function () {
		let template = _.template($('#guildNewStatic').html());
		this.$el.html(template);
		return this;
	},

	onInputChange: function (e) {
		// this.model.set(e.target.name, e.target.value);
		var result = this.model.validate(e.target);
		if (result !== true)
			this.showInputErrors(result);
		else
			$('#newguildform').find('.error').remove();

	},

	showInputErrors: function (errors) {
		var $target = $('#newguildform');
		var errorsHTML = '';

		$target.find('.error').remove();

		errorsHTML += this.templates.error({ error: errors });

		$target.prepend(errorsHTML);
	}

});
