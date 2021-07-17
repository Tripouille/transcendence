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
		let model = new Guild();
		var self = this;
		model.save({ name: $('#name').val(), anagram: $('#anagram').val() }, {
			success: function (model, response, options) {
				Backbone.history.navigate("guilds/" + model.get('id'), { trigger: true });
			},
			error: function (model, response, options) {
				if (response.responseText.includes('PG::UniqueViolation: ERROR:  duplicate key value violates unique constraint \"index_guilds_on_name\"\n'))
					self.showPopUpError("Guild name already exist.");
				else if (response.responseText.includes('PG::UniqueViolation: ERROR:  duplicate key value violates unique constraint \"index_guilds_on_anagram\"\n'))
					self.showPopUpError("Anagram already exist.");
				else if (response.responseText.includes('"{"name":["is too long') || response.responseText.includes('{"name":["is too short'))
					self.showPopUpError("Guild name must be 2 to 20 characters long.");
				else if (response.responseText.includes('"{"anagram":["is too long') || response.responseText.includes('{"anagram":["is too short'))
					self.showPopUpError("Anagram must be 1 to 5 characters long.");
				else
					self.showPopUpError("Server error.");
			}
		});
	},
	onFormCancel: function () {
		Backbone.history.history.back();
	},
	/* render the form page */
	render: function () {
		this.$el.empty();
		this.$el.attr({ id: 'guildNew' });

		window.currentUser.fetch().done(function () {
			let guildId = window.currentUser.get('guild_id');
			if (guildId != null) {
				Backbone.history.navigate("guilds/" + guildId, { trigger: true });
			}
			else {
				let template = _.template($('#guildNewStatic').html());
				$('main#guildNew').html(template);
				$('main#guildNew input#name').focus();
			}
			return this;
		});
	},
	/* validate the labels on the go */
	validateOnChange: function (attr) {
		if (attr.name == "name") {
			if (attr.value == "" || attr.value.length < 2 || attr.value.length > 20)
				return "Guild name must be 2 to 20 characters long.";
			if (attr.value.trim() == "" || attr.value != attr.value.trim())
				return "Guild name must not begin or end with spaces";
		}
		if (attr.name == "anagram") {
			if (attr.value == "" || attr.value.length > 5)
				return "Anagram must be 1 to 5 characters long.";
			if (attr.value.trim() == "" || attr.value != attr.value.trim())
				return "Anagram name must not begin or end with spaces";
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
	},
	showPopUpError: function (error) {
		const $erroPopUp = $('#errorPopUp');

		$erroPopUp.html(error);
		$erroPopUp.stop().fadeIn(100);
		$erroPopUp.css("display", "block");
		setTimeout(function () {
			$erroPopUp.stop().fadeOut(1000, function () {
				$erroPopUp.css("display", "none");
			});
		}, 4000);
	}
});
