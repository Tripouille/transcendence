import ChatRoom from "../models/chatRoom";

const ChatRooms = Backbone.Collection.extend({
	model: ChatRoom,
	url: "/chat_rooms"
});

export default ChatRooms;