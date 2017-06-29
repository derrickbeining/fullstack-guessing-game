var gameState;

function ready(fn) {
	"use strict";
	//for IE6-10
	if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
		fn();
	} else { //for everyone else
		document.addEventListener("DOMContentLoaded", fn);
	}
}

function start() {
	"use strict";
    
	var dom = window.document,
		bodyElmt = dom.getElementsByTagName("body")[0],
		rangeChoiceMinOnPlay = dom.getElementById("rangeChoiceMinOnPlay"),
		rangeChoiceMaxOnPlay = dom.getElementById("rangeChoiceMaxOnPlay"),
		startDialogRangeMinInput,
		startDialogRangeMaxInput,
		startDialogErrorMsg = dom.getElementsByClassName("start-dialog-error")[0],
		feedbackText = dom.getElementById("feedbackText"),
		playButton = dom.getElementById("playButton"),
		playAgainButton = dom.getElementById("playAgainButton"),
		feedbackOkButton = dom.getElementById("feedbackOkButton"),
		rangeMinDisplay = dom.getElementById("minValueDisplay"),
		rangeMaxDisplay = dom.getElementById("maxValueDisplay"),
		guessInput = dom.getElementById("guessInput"),
		pastGuessHolders = dom.getElementsByClassName("past-guess"),
		submitButton = dom.getElementById("submitButton"),
		resetButton = dom.getElementById("resetButton"),
		hintButton = dom.getElementById("hintButton");
    
	function generateWinningNumber(maxNum) {
		return Math.floor(Math.random() * maxNum) + 1;
	}

	// function shuffle(array) {
	// 	for (var i = array.length - 1; i > 0; i--) {
	// 		var j = Math.floor(Math.random() * (i + 1));
	// 		var temp = array[i];
	// 		array[i] = array[j];
	// 		array[j] = temp;
	// 	}
	// 	return array;
	// }

	function Game() {
		this.playersGuess = null;
		this.pastGuesses = [];
		this.minNum = startDialogRangeMinInput;
		this.maxNum = startDialogRangeMaxInput;
		this.winningNumber = generateWinningNumber(this.maxNum);
	}

	Game.prototype.differenceAbs = function() {
		return Math.abs(this.winningNumber - this.playersGuess);
	};
    
	Game.prototype.difference = function () {
		return this.winningNumber - this.playersGuess;
	};

	Game.prototype.isLower = function() {
		return this.playersGuess < this.winningNumber;
	};

	Game.prototype.inputErrorDetected = function(input) {
		return input > this.maxNumber || input < this.minNumber || typeof input !== "number";
	};

	Game.prototype.checkGuess = function() {
		var that = this,
			playerLost,
			playerWon = this.playersGuess === this.winningNumber,
			isOutOfRange = this.playersGuess > this.maxNum || this.playersGuess < this.minNum,
			isDuplicate = this.pastGuesses.some(function(el) {
				return el === that.playersGuess;
			});
        
		if (playerWon) {
			return "Holy crap! You guessed it!";
		} else if (isDuplicate) {
			return "Invalid: You already guessed that number, silly.";
		} else if (isOutOfRange) {
			return "Invalid: That number is out of range.";
		} else {
			this.pastGuesses.push(this.playersGuess);
			playerLost = this.pastGuesses.length >= 5;
			if (playerLost) {
				return "Nope! Sorry, you lose.";
			} else {
				return this.temperature();
			}
		}
	};

	Game.prototype.temperature = function() {
		if (this.differenceAbs() < 10) {
			return "You're burning up!";
		} else if (this.differenceAbs() < 25) {
			return "You're lukewarm.";
		} else if (this.differenceAbs() < 50) {
			return "You're a bit chilly.";
		} else {
			return "You're ice cold!";
		}
	};

	Game.prototype.playersGuessSubmission = function(n) {
		if (this.inputErrorDetected(n)) {
			throw "That is an invalid guess.";
		} else {
			this.playersGuess = n;
			return this.checkGuess();
		}
	};
    
	Game.prototype.setMinNum = function(n) {
		this.minNum = n;
	};
    
	Game.prototype.setMaxNum = function(n) {
		this.maxNum = n;
	};

	Game.prototype.provideHint = function() {
		if (this.difference() > 0) {
			return "Your last guess was too low.";
		} else {
			return "Your last guess was too damn high!";
		}
		/*var hint = [this.winningNumber, generateWinningNumber(), generateWinningNumber()];
        var hasNoDuplicate = (hint[0] !== hint[1] && hint[0] !== hint[2] && hint[1] !== hint[2]);
        if (hasNoDuplicate) {
            return shuffle(hint).join(', ');
        } else {
            return this.provideHint();
        }*/
	};
    
	function startNewGame() {
		var maxInputLength = rangeChoiceMaxOnPlay.value.length;
		gameState = new Game();
		gameState.setMinNum(startDialogRangeMinInput);
		gameState.setMaxNum(startDialogRangeMaxInput);
		setRangeMinDisplay();
		setRangeMaxDisplay();
		resetPastGuessesDisplay();
		resetFeedbackDialog();
		guessInput.setAttribute("maxlength", maxInputLength.toString());
		guessInput.setAttribute("pattern", "[0-9]{1," + maxInputLength.toString() + "}");
		hideStartDialog();
	}
    
	function setRangeMinDisplay() {
		rangeMinDisplay.textContent = gameState.minNum;
	}
    
	function setRangeMaxDisplay() {
		rangeMaxDisplay.textContent = gameState.maxNum;
	}
    
	function resetFeedbackDialog() {
		feedbackText.textContent = "Uh, it's between " + gameState.minNum + " and " + gameState.maxNum + "? Sorry, can't really give you a hint on the first guess.";
	}
    
	function resetPastGuessesDisplay() {
		["N", "O", "P", "E", "!"].forEach(function(el, i) {
			pastGuessHolders[i].textContent = el;
			pastGuessHolders[i].classList.remove("red");
		});
	}
    
	function showStartDialog() {
		bodyElmt.classList.add("start-dialog");
	}
    
	function hideStartDialog() {
		bodyElmt.classList.remove("start-dialog");
	}
    
	function showFeedbackDialog() {
		var gameEnded = gameState.pastGuesses.length > 4 || gameState.playersGuess === gameState.winningNumber;
		if (gameEnded) {
			hideFeedbackOkButton();
			showPlayAgainButton();
			listenPlayAgain();
		} else {
			showFeedbackOkButton();
			addListener(feedbackOkButton, "click", hideFeedbackDialog);
		}
		bodyElmt.classList.add("feedback-dialog");
	}
    
	function hideFeedbackDialog() {
		removeListener(feedbackOkButton, "click", hideFeedbackDialog);
		bodyElmt.classList.remove("feedback-dialog");
	}
    
	function showStartDialogError() {
		startDialogErrorMsg.classList.remove("hide");
		addListener(rangeChoiceMinOnPlay, "input", hideStartDialogError);
		addListener(rangeChoiceMaxOnPlay, "input", hideStartDialogError);
		//        rangeChoiceMinOnPlay.addEventListener('change', hideStartDialogError);
		//        rangeChoiceMaxOnPlay.addEventListener('change', hideStartDialogError);
	}
    
	function hideStartDialogError() {
		startDialogRangeMinInput = Number.parseInt(rangeChoiceMinOnPlay.value);
		startDialogRangeMaxInput = Number.parseInt(rangeChoiceMaxOnPlay.value);
		if (startDialogRangeMaxInput >= startDialogRangeMinInput + 5) {
			startDialogErrorMsg.classList.add("hide");
		}
	}
    
	function hideFeedbackOkButton() {
		removeListener(feedbackOkButton, "click", hideFeedbackOkButton);
		feedbackOkButton.classList.add("hide");
	}
    
	function showFeedbackOkButton() {
		feedbackOkButton.classList.remove("hide");
		addListener(feedbackOkButton, "click", hideFeedbackOkButton);
	}
    
	function hidePlayAgainButton() {
		removeListener(playAgainButton, "click", hidePlayAgainButton);
		playAgainButton.classList.add("hide");
		showFeedbackOkButton();
	}
    
	function showPlayAgainButton() {
		playAgainButton.classList.remove("hide");
		addListener(playAgainButton, "click", hidePlayAgainButton);
	}
    
	function showSubmitButton() {
		submitButton.classList.remove("hide");
	}
    
	function hideSubmitButton() {
		submitButton.classList.add("hide");
	}
    
	function addToPastGuessDisplay() {
		var i = gameState.pastGuesses.length - 1;
		pastGuessHolders[i].classList.add("red");
		pastGuessHolders[i].textContent = gameState.pastGuesses[i];
	}
    
	function handleGuessSubmission() {
		var response = gameState.playersGuessSubmission(Number.parseInt(guessInput.value));
		feedbackText.textContent = response;
		guessInput.value = "";
		hideSubmitButton();
		showFeedbackDialog();
		addToPastGuessDisplay();
	}
    
	function handlePlay() {
		startDialogRangeMinInput = Number.parseInt(rangeChoiceMinOnPlay.value);
		startDialogRangeMaxInput = Number.parseInt(rangeChoiceMaxOnPlay.value);
		if (startDialogRangeMaxInput < startDialogRangeMinInput + 5) {
			showStartDialogError();
		} else {
			startNewGame();
		}
	}
    
	function handlePlayAgain() {
		hideFeedbackDialog();
		showStartDialog();
	}
    
	function handleTyping() {
		if (Number.parseInt(guessInput.value) > 0) {
			showSubmitButton();
		} else {
			hideSubmitButton();
		}
	}
    
	function handleReset() {
		showStartDialog();
	}
    
	function handleHint() {
		if (gameState.playersGuess) {
			feedbackText.textContent = gameState.provideHint();
		}
		showFeedbackDialog();
	}
    
	function addListener(element, event, func){
		if (element.attachEvent) {
			return element.attachEvent("on"+event, func);
		} else {
			return element.addEventListener(event, func, false);
		}
	}
    
	function removeListener(element, event, func) {
		if (element.removeEventListener) {
			element.removeEventListener(event, func, false);
		} else {
			element.detachEvent("on" + event, func);
		}
	}
    
	function listenPlay() {
		//        playButton.addEventListener('click', handlePlay);
		addListener(playButton, "click", handlePlay);
	}
    
	function listenPlayAgain() {
		addListener(playAgainButton, "click", handlePlayAgain);
	}
    
	function listenInputTyping() {
		//        guessInput.addEventListener('input', handleTyping);
		addListener(guessInput, "input", handleTyping);
	}
    
	function listenGuessSubmission() {
		//        submitButton.addEventListener('click', handleGuessSubmission);
		addListener(submitButton, "click", handleGuessSubmission);
	}
    
	function listenReset() {
		addListener(resetButton, "click", handleReset);
	}
    
	function listenHint() {
		addListener(hintButton, "click", handleHint);
	}
    
    
    
	listenPlay();
	listenInputTyping();
	listenGuessSubmission();
	listenReset();
	listenHint();
    
}

ready(start);