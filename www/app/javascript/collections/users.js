import { User } from "../models/user";

export const Users = Backbone.Collection.extend({
	model: User,
	url: "/users",
    initialize: function() {
        this.on('add', function(model) {
            console.log('an user got added');
        });
        this.on('remove',  function(model) {
            console.log('an user got removed');
        });
        this.on('change', function(model) {
            console.log('an user got changed');
        });
    }
});