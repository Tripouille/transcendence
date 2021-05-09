import consumer from "./consumer"

consumer.subscriptions.create("RoomChannel", {
  connected() {
	  console.log('connected to room !');
    // Called when the subscription is ready for use on the server
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
  },

  received(data) {
    // Called when there's incoming data on the websocket for this channel
    console.log("Recieving:");
    console.log(data.content);
	$('#msg').append('<div class="message"> ' + data.content + '</div>')
  }
});
