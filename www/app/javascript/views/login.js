export const LoginView = Backbone.View.extend({

	el: 'body',

	events: {
		'mouseover .retro-btn': 'mouseHandler',
		'click .retro-btn' : 'clickHandler'
	  },

	template: _.template( $('#login-blocTemplate').html()),

	initialize: function() {
		console.log("Remove nav bar on login Page");
		$("#mainNav").remove();
		$("#contacts").remove();
		$("#chat").remove();
	},

	render: function(){
		$("#main-bloc").empty();
        $("#main-bloc").html(this.template);
        return this;
	},

	clickHandler : function(){
		console.log('I was clicked!');
	},

	mouseHandler : function(e){
		console.log('mouse handler');
		console.log('newClass = ' + newClass);
		$('a.btn').toggleClass('btn-center');
	}

});

// $( "#target" ).on( "click", function( event ) {
// 	currentMousePos.x = event.pageX;
// 	currentMousePos.y = event.pageY;

// 	console.log( currentMousePos );
// } );

// buttons[i].addEventListener("mousemove", function(e) {
//     var leftOffset = this.getBoundingClientRect().left;
//     var btnWidth = this.offsetWidth;
//     var myPosX = e.pageX;
//     var newClass = "";
//     // if on left 1/3 width of btn
//     if(myPosX < (leftOffset + .3 * btnWidth) ) {
//       newClass = 'btn-left'
//     } else {
//       // if on right 1/3 width of btn
//       if(myPosX > (leftOffset + .65 * btnWidth) ) {
//         newClass = 'btn-right';
//       } else {
//         newClass = 'btn-center';
//       }
//     }
//     // remove prev class
//     var clearedClassList = this.className.replace(/btn-center|btn-right|btn-left/gi, "").trim();
//     this.className = clearedClassList + " " + newClass;
//   });
// }
