import { Users } from '../collections/users';
import { UserView } from '../views/user';

const UsersView = Backbone.View.extend({
	tagName: "ul",
	collection: new Users(),

	initialize: function() {
		//console.log('Users view has been initialized');
		//this.listenTo(this.collection, "add", this.render);
		//this.listenTo(this.collection, "remove", this.render);
		//this.listenTo(this.collection, "change", this.render);
	},

	render: function($parent) {
		const $ul = this.$el;
		$ul.empty();
		this.collection.fetch({success: function(collection, response, options) {
			for (let i = 0; i < collection.length; ++i) {
				let userView = new UserView({model: collection.at(i)});
				$ul.append(userView.$el);
			}
			$parent.append($ul);
		}});
		return this;
	}
});

export default UsersView;