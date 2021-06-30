import ChatRoom from "../models/chatRoom";

const ChatRooms = Backbone.Collection.extend({
	model: ChatRoom,
	url: "/chat_rooms",

	comparator: function(r) {
		return (r.name ? r.name.toLowerCase() : 0);
	}
});

export default ChatRooms;