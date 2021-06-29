const ChatRoom = Backbone.Model.extend({
	toJSONDecorated: function() {
		const result = this.toJSON();
		if (result.room_type == 'direct_message')
			result.name = result.users[0].login;
		const me = result.users.find(user => user.id == window.user_id);
		result.admin = me.admin;
		return result;
	}
});

export default ChatRoom;