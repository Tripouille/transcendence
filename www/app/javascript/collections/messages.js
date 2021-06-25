import Message from "../models/message";

const Messages = Backbone.Collection.extend({
	model: Message
});

export default Messages;