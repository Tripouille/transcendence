import { Users } from 'collections/users';
import { UsersView } from 'views/users';
import { User } from "models/user";
import { View1, View2, View3 } from "views/general";

$(function() {
	const viewOptions = {el: $('#GeneralView')};
	let view1 = new View1(viewOptions);
	let view2 = new View2(viewOptions);
	let view3 = new View3(viewOptions);

	function showView1() {
		view1.render();
	}
	function showView2() {
		view2.render();
	}
	function showView3() {
		view3.render();
	}

	let userCollection = new Users();
	userCollection.fetch({
		success: function(collection, response) {
			let usersView = new UsersView({el: $('#UsersView'), model: userCollection});
		}
	});
	$('#view1button').on('click', showView1);
	$('#view2button').on('click', showView2);
	$('#view3button').on('click', showView3);
});
