import consumer from "./consumer"
import * as Pong from "../views/animations/game"

// const pongSubscription = consumer.subscriptions.create("PongChannel", {
//   connected() {
// 		// Called when the subscription is ready for use on the server
// 		console.log('connected to pong channel');
// 		subscription.send({message: "send from client"});
//   },

//   disconnected() {
// 		// Called when the subscription has been terminated by the server
// 		console.log('disconnected from pong channel');
// 	},

//   received(data) {
// 		// Called when there's incoming data on the websocket for this channel
// 		Pong.enemyMove(data.content);
// 	}
// });
