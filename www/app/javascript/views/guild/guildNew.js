import { GuildModel } from '../../models/guild';
import { User } from '../../models/user';

export const GuildNewView = Backbone.View.extend({
	events: {
		'click #formSubmitNewGuild a': 'onFormSubmit',
		'blur input[required]': 'onInputChange',
		'focus input[required]': function (e) {
			this.resetInputErrors(e.target);
		}
	},
	templates: {
		'error': _.template('<span class="error"><%=error%></span>')
	},
	onFormSubmit: function () {
		/* get data from form on submit button */
		/* save the new guild and the guild_id to the current user databses */
		let showError = this;
		window.currentUser.fetch().done(function () {
			let model = new GuildModel();
			model.set('name', $('#name').val());
			model.set('anagram', $('#anagram').val());
			model.set('owner_id', window.currentUser.get('id'));
			var self = showError;
			/* A VERIFIER Faire une verification pour voir si le current user a bien un id valid ou verif doit se faire avant? */
			model.save({}, {
				success: function (model, response, options) {
					console.log("Succes saving guild model");
					window.currentUser.fetch().done(function () {
						/* A VERIFIER si l'utilisateur ne possede pas deja une guild_id sinon supprimer la guilde qui vient d'etre save et renvoyer un message d'erreur */
						window.currentUser.set('guild_id', model.get('id'));
						let routeId = "guilds/" + model.get('id');
						if (window.currentUser.isValid() != true)
							model.destroy();
							window.currentUser.save({}, {
							success: function (userModel, resp, options) {
								console.log("The guild_id has been saved to the user");
								Backbone.history.navigate(routeId, { trigger: true });
							},
							error: function (userModel, resp, options) {
								console.log("Something went wrong while saving the guild_id to the user");
								console.log(resp.responseText);
								model.destroy(); // VERIFIER si fonctionnel
							}
						});
					});
				},
				error: function (model, response, options) {
					console.log("Something went wrong while saving the new guild");
					/* Regex to match
					   DETAIL:  Key (name)=(Olivier Lidon) already exists.
					   |____________||__||_______________________________|
							  1^      2^      1       3^  2                 3
									 |--------^--------||-^||---------------^------------| */
					let regexKey = /(?<=DETAIL:  Key \()(.*)(?=\)=\((.*)\) already exists)/g;
					let label = response.responseText.match(regexKey)[0];
					/* AJOUTER reset error */
					if (label == "name" || label == "anagram")
						self.showInputErrors(label.charAt(0).toUpperCase() + label.slice(1) + " already exist.", label);
					else
						self.showInputErrors("Unknown server error.", "name");
				}
			});
		});
	},
	/* render the form page */
	render: function () {
		let that = this;
		window.currentUser.fetch().done(function () {
			let guildId = window.currentUser.get('guild_id');
			if (guildId != null) {
				console.log("redirection propre guilde")
				Backbone.history.navigate("guilds/" + guildId, { trigger: true });
			}
			else {
				console.log("new form")
				let template = _.template($('#guildNewStatic').html());
				that.$el.html(template);
			}
			return this;
		});
	},
	/* validate the labels on the go */
	validateOnChange: function (attr) {
		if (attr.name == "name") {
			if (attr.value == "" || attr.value.length < 5 || attr.value.length > 30) {
				return "Guild name must be between 5 and 30 characters long."
			}
		}
		if (attr.name == "anagram") {
			if (attr.value == "" || attr.value.length > 5) {
				return "Anagram must be 5 characters max."
			}
		}
		return true;
	},
	onInputChange: function (e) {
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
