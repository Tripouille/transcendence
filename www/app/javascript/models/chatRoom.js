const ChatRoom = Backbone.Model.extend({
	initialize: function() {
		this.name = this.get('name');
		if (this.get('room_type') == 'direct_message') {
			this.name = this.get('users')[0].id == window.user_id ? this.get('users')[1].login : this.get('users')[0].login;
		}
	},
	toJSONDecorated: function() {
		const result = this.toJSON();
		if (result.room_type == 'direct_message')
			result.name = result.users[0].id == window.user_id ? result.users[1].login : result.users[0].login;
		const me = result.users.find(user => user.id == window.user_id);
		result.admin = me.admin;
		return result;
	}
});

export default ChatRoom;