import { UserModel } from "../models/userModel";

export const UsersCollection = Backbone.Collection.extend({
	model: UserModel,
	url: "/users",

	initialize: function() {
		this.updateCollection();
		// console.log(this);
	},

	updateCollection: function() {
        this.fetch({
			success: function(collection, response, options) {
				console.log("fetched user-collection with sucess");
                return this;

			},
			error: function(){
				console.log("fetched user-collection with failure");
			}
		});
	},
});