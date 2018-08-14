// Check off specific Todos by clicking them
$("ul").on("click", "li", function(){
	$(this).toggleClass("completed");
});

//Click on X to delete Todo
$("ul").on("click", "span",  function(event){
	//.parent() will allow us to delete the full li and not just the span
	$(this).parent().fadeOut(500,function(){
		//do .remove here as if above it wont wait for the fade out
		$(this).remove();
	});
	//this stops the class completed running after the click event
	event.stopPropagation();
});

$("input[type='text']").keypress(function(event){
	//13 is the which number for enter
	if(event.which === 13){
	//grabbing new todo text from input
		var todoText = $(this).val();
		$(this).val("");
		//create a new li and add to ul
		$("ul").append("<li><span><i class='fa fa-trash'></i></span> " + todoText + "</li>")
	}
});

$(".fa-plus").click(function(){
	$("input[type='text']").fadeToggle();
});