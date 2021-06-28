import ChatRoom from "../models/chatRoom";

const ChatRooms = Backbone.Collection.extend({
	model: ChatRoom,
	url: "/chat_rooms",

	comparator: function(r) {
		return (r.get('name').toLowerCase());
	}
});

export default ChatRooms;