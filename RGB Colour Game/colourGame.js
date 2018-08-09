var numSquares = 6
var colours = [];
var pickedColour;
var h1 = document.querySelector("h1");
var squares = document.querySelectorAll(".square");
var colourDisplay = document.getElementById("colourDisplay");
var messageDisplay = document.querySelector("#message");
var resetButton = document.querySelector("#reset");
var modeButtons = document.querySelectorAll(".mode");

init();

function init(){
	//mode buttons event listeners
	for(var i = 0; i < modeButtons.length; i++){
		modeButtons[i].addEventListener("click", function(){
		modeButtons[0].classList.remove("selected");
		modeButtons[1].classList.remove("selected");
		this.classList.add("selected");

		if(this.textContent === "Easy"){
			numSquares = 3;
		} else {
		numSquares = 6;
		}
		reset();

		});
	}

	for (var i = 0; i < squares.length; i++){

	//add click listeners to squares
	squares[i].addEventListener("click", function(){
		//grabs colour of clicked square
		var clickedColour = this.style.backgroundColor;
		//compare the correct colour to the picked colour
		if(clickedColour === pickedColour){
			messageDisplay.textContent = "Correct!";
			resetButton.textContent = "Play Again?";
			changeColours(clickedColour);
			h1.style.backgroundColor = clickedColour;
		} else {
			this.style.backgroundColor = "#232323";
			messageDisplay.textContent = "Try Again";
		}
	});
}

reset();

}



function reset(){
	colours = generateRandomColours(numSquares);
	// new random colour from array
	pickedColour = pickColour();
	//change colourDisplay to match picked colour
	colourDisplay.textContent = pickedColour;
	resetButton.textContent = "New Colours";

	messageDisplay.textContent = "";

	for(var i = 0; i < squares.length; i++){
		if(colours[i]){
		squares[i].style.display = "block";
		squares[i].style.backgroundColor = colours[i];
	} else {
		squares[i].style.display = "none";
	}

	}
	h1.style.backgroundColor = "steelblue";
}


resetButton.addEventListener("click", function(){
	reset();
});

function changeColours(colour){
	for (var i = 0; i < squares.length; i++){
		//if correct square hit then changes rest of squares to that colour
		squares[i].style.backgroundColor = colour;
	}
}

function pickColour(){
	var random = Math.floor(Math.random() * colours.length);
	return colours[random];
}

function generateRandomColours(num){
	var arr = [];
	//add num random colours to array
	for (var i = 0; i < num; i++){
		//get random colour and push into array
		arr.push(randomColour());
		

	}
	return arr;
}

function randomColour(){
	//need a red from 0 - 255
	var r = Math.floor(Math.random() * 256);
	//need a green from 0 - 255
	var g = Math.floor(Math.random() * 256);
	//need a blue from 0 - 255
	var b = Math.floor(Math.random() * 256);
	
	return "rgb(" + r + ", " + g + ", " + b + ")";
}