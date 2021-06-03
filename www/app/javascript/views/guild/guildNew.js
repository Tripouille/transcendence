import { GuildModel } from '../../models/guild';
import { User } from '../../models/user';

export const GuildNewView = Backbone.View.extend({

	events: {
		'click #formSubmitNewGuild input': 'onFormSubmit',
		'blur input[required]': 'onInputChange',
		'focus input[required]': function (e) {
			this.resetInputErrors(e.target);
		}
	},

	templates: {
		'error': _.template('<span class="error"><%=error%></span>')
	},

	onFormSubmit: function (e) {
		/* get data from form on submit button */
		let model = new GuildModel();

		e.preventDefault();
		/* save the new guild and the guild_id to the current user databses */
		model.set('name', $('#name').val());
		model.set('anagram', $('#anagram').val());
		model.set('owner_id', window.currentUser.get('id'));
		model.save({}, {
			success: function (model, response, options) {
				console.log("Succes saving guild model");
				let userModel = new User();
				userModel.set('id', window.currentUser.get('id'))
				$.when(userModel.fetch()).done(function () {
					userModel.set('guild_id', model.get('id'));
					userModel.save({
						/* Pourquoi succes ne s'affiche pas */
						success: function (userModel, resp, options) {
							console.log("The guild_id has been saved to the user");
						},
						error: function (userModel, resp, options) {
							console.log("Something went wrong while saving the guild_id to the user");
							console.log(resp.responseJSON);
						}
					});
				});
				$("#guilds").trigger("click");
			},
			error: function (model, response, options) {
				console.log("Something went wrong while saving the new guild");
				console.log(response.responseJSON);
			}
		});
	},
	/* render the form page */
	render: function () {
		let template = _.template($('#guildNewStatic').html());

		this.$el.html(template);
		return this;
	},
	/* validate the labels on the go */
	validateOnChange: function (attr) {
		if (attr.name == "name") {
			if (attr.value.length < 5 || attr.name.length > 20) {
				return "Invalid name length."
			}
		}
		if (attr.name == "anagram") {
			if (attr.value == "" || attr.value.length > 5) {
				return "Invalid anagram length."
			}
		}
		return true;
	},
	onInputChange: function (e) {
		/* transformer e.target au format attr pour tout mettre avec la fonction validate */
		var result = this.validateOnChange(e.target);

		if (result !== true)
			this.showInputErrors(result, e.target.name);
	},
	resetInputErrors: function (e) {
		$('#newGuildForm').find('label[for=' + e.name + '] span').remove();
	},
	showInputErrors: function (errors, labelName) {
		var $target = $('label[for=' + labelName + ']');
		var errorHTML = '';

		errorHTML += this.templates.error({ error: errors });
		$target.append(errorHTML);
	}
});
