const assetUrl = "https://assets.codepen.io/225363/";
const btnStart = document.querySelector(".start-game");
const btnSound = document.querySelector(".sound-control");
const padsContainer = document.querySelector(".pads-container");
const pads = padsContainer.querySelectorAll(".pad");
const colors = [...pads].map((pad) => pad.dataset.pad);
const infoContainer = document.querySelector(".info-container");
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const highScoreText = document.querySelector('.highscore-text')
let highScore = localStorage.getItem("highScore") || 0;

document.querySelectorAll("*").forEach(e => {
	e.addEventListener("contextmenu", e => {
		e.stopPropagation()
		e.preventDefault()
	})
	e.addEventListener("dragstart", e => {
		e.stopPropagation()
		e.preventDefault()
	})
})

highScoreText.innerHTML = `High Score: ${highScore}`

let sounds = {}
pads.forEach((pad,index) => {
	index +=1;
	sounds[`pad${index}`] = new Audio(`${assetUrl}pad${index}.mp3`);
});
sounds['miss'] = new Audio(`${assetUrl}miss.mp3`);

const cls = {
	active: "active",
	play: "play",
	wait: "wait",
	mute: "mute"
};

let sequence = [];
let isAudioMuted = false;
let step, speed;

const addSequenceStep = () => {
	sequence.push(colors[Math.floor(Math.random() * colors.length)]);
};

const handlePadClick = (e) => {
	if (e.target.dataset.pad === sequence[step]) {
		!isAudioMuted && handlePadSound(e.target.dataset.sound);
		step++;
	} else {
		!isAudioMuted && handlePadSound("miss");
		endGame();
	}

	if (step === sequence.length) {
		waitPlayerTurn(true);
		updateInfoText(`Level ${sequence.length + 1}`);
		setTimeout(() => startLevel(), speed);
	}
};

const handlePadSound = (sound) => {
	if (!sounds[sound].paused) {
		sounds[sound].pause();
		sounds[sound].currentTime = 0;
	}
	sounds[sound].play();
};

const setHighScore = () => {
	if(sequence.length > highScore){
		highScore = sequence.length; 
		localStorage.setItem('highScore',highScore)
	}
	highScoreText.innerHTML = `High Score: ${highScore}`
} 

const endGame = () => {
	waitPlayerTurn(true);
	setHighScore()
	updateInfoText(`Game over at level ${sequence.length}`);
	padsContainer.classList.remove(cls.play);
	btnStart.disabled = false;
};

const animatePad = (name) => {
	const pad = document.querySelector(`[data-pad="${name}"]`);

	pad.classList.add(cls.active);
	!isAudioMuted && handlePadSound(pad.dataset.sound);
	setTimeout(() => pad.classList.remove(cls.active), speed / 2);
};

const runSequence = () => {
	sequence.forEach((step, i) => {
		setTimeout(() => animatePad(step), (i + 1) * speed);
	});
};

const startLevel = () => {
	if (speed > 250) {
		speed -= sequence.length * 3;
	}

	step = 0;
	addSequenceStep();
	runSequence();
	setTimeout(() => waitPlayerTurn(false), (sequence.length + 1) * speed);
};

const startNewGame = () => {
	btnStart.disabled = true;
	sequence = [];
	speed = 500;
	padsContainer.classList.add(cls.play);
	padsContainer.style.setProperty("--speed", speed + "ms");
	waitPlayerTurn(true);
	updateInfoText("Level 1");
	startLevel();
};

const updateInfoText = (text) => {
	infoContainer.textContent = text;
	infoContainer.classList.add(cls.active);
	setTimeout(() => infoContainer.classList.remove(cls.active), speed);
};

const waitPlayerTurn = (waiting) => {
	waiting
		? [...pads].forEach((pad) => (pad.disabled = true))
		: [...pads].forEach((pad) => (pad.disabled = false));
};

btnStart.addEventListener("mousedown", startNewGame);

btnSound.addEventListener("mousedown", () => isAudioMuted = btnSound.classList.toggle("mute"));

padsContainer.addEventListener("mousedown", (e) => {
	if (e.target.classList.contains("pad")) {
		handlePadClick(e);
	}
});