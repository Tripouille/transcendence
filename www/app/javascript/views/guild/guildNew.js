import { Guild } from '../../models/guild';

export const GuildNewView = Backbone.View.extend({
	events: {
		'click #formSubmitNewGuild a': 'onFormSubmit',
		'click #formCancelNewGuild a': 'onFormCancel',
		'blur input[required]': 'onInputChange',
		'focus input[required]': function (e) {
			this.resetInputErrors(e.target.name);
		}
	},
	templates: {
		'error': _.template('<span class="error"><%=error%></span>')
	},
	onFormSubmit: function () {
		/* get data from form on submit button */
		/* save the new guild and the guild_id to the current user databses */
		this.resetInputErrors("name");
		this.resetInputErrors("anagram");
		let model = new Guild();
		var self = this;
		model.save({ name: $('#name').val(), anagram: $('#anagram').val() }, {
			success: function (model, response, options) {
				Backbone.history.navigate("guilds/" + model.get('id'), { trigger: true });
			},
			error: function (model, response, options) {
				console.log("Something went wrong while saving the new guild");
				/* TROUVER UN MOYEN DE PARSER LE RETOUR D'ERREUR DU SERVEUR */
				self.showInputErrors("Unknown server error.", "name");
			}
		});
	},
	onFormCancel: function () {
		Backbone.history.history.back();
	},
	/* render the form page */
	render: function () {
		let that = this;
		window.currentUser.fetch().done(function () {
			let guildId = window.currentUser.get('guild_id');
			if (guildId != null) {
				Backbone.history.navigate("guilds/" + guildId, { trigger: true });
			}
			else {
				let template = _.template($('#guildNewStatic').html());
				that.$el.html(template);
			}
			return this;
		});
	},
	/* validate the labels on the go */
	validateOnChange: function (attr) {
		if (attr.name == "name") {
			if (attr.value == "" || attr.value.length < 2 || attr.value.length > 30) {
				return "Guild name must be 2 to 30 characters long."
			}
		}
		if (attr.name == "anagram") {
			if (attr.value == "" || attr.value.length > 5) {
				return "Anagram must be 1 to 5 characters long."
			}
		}
		return true;
	},
	onInputChange: function (e) {
		var result = this.validateOnChange(e.target);

		if (result !== true)
			this.showInputErrors(result, e.target.name);
	},
	resetInputErrors: function (name) {
		$('#newGuildForm').find('label[for=' + name + '] span').remove();
	},
	showInputErrors: function (errors, labelName) {
		var $target = $('label[for=' + labelName + ']');
		var errorHTML = '';

		errorHTML += this.templates.error({ error: errors });
		$target.append(errorHTML);
	}
});
