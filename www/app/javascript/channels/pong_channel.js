import consumer from "./consumer"
import * as Pong from "../views/animations/game"

consumer.subscriptions.create("PongChannel", {
  connected() {
		// Called when the subscription is ready for use on the server
		console.log('connected to pong channel');
  },

  disconnected() {
		// Called when the subscription has been terminated by the server
		console.log('disconnected from pong channel');
	},

  received(data) {
		// Called when there's incoming data on the websocket for this channel
		console.log('received from pong channel :');
		console.log(data.content);
		Pong.test();
	}
});
