const ChatRoom = Backbone.Model.extend({
	toJSONDecorated: function() {
		const result = this.toJSON();
		if (result.room_type == 'direct_message')
			result.name = result.users[0].login;
		return result;
	}
});

export default ChatRoom;