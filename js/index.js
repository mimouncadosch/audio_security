//some global vars
var meyda;
var extractionInterval;

var sampleRate = 20;				// How often the program extracts the features
var intervalSize = 150;				// How many feature samples to compute mean and stdev 
var intervalMfcc = [];				// Array of the features used for computing mean and stdev
var energyThresh = 1;				// Program runs classifier if energy level above this threshold
var label = 'room';					// DOM is by default "Room"
var e; 								// Energy level
var trailingEnergy = new Array(100);	// Trailing level of energy (50 last values)		

// Flow variables
var clock_started = false;
var start;
var end;

function init() {
	document.getElementById('audio_label').innerHTML = 'Initializing...';
	document.getElementById('pic_label').setAttribute("src", "../img/room.jpg");
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	navigator.getUserMedia = ( navigator.getUserMedia ||
               navigator.webkitGetUserMedia ||
               navigator.mozGetUserMedia ||
               navigator.msGetUserMedia);

	var context = new AudioContext();

	window.source = context.createBufferSource();
	source.connect(context.destination);

	if (navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia) {

		//get the input
		navigator.getUserMedia({ video: false, audio: true },
			function(mediaStream) {
				window.source = context.createMediaStreamSource(mediaStream);
				meyda = new Meyda(context,source,512);
				startExtraction();
			},
			function(err) {
				alert("There has been an error accessing the microphone.");
			}
		)
	}
}

function startExtraction() {
	window.extractionInterval = setInterval(function() {	// Every (sampleRate) do:
		var f = meyda.get(["energy", "mfcc"]);
		e = f["energy"]; 	// Energy
		console.log(jStat.mean(trailingEnergy));
		
		trailingEnergy.push(Math.round(e*10000)/10000);
		trailingEnergy.shift();
		
		// document.getElementById('audio_label').innerHTML = label;
		if (clock_started == false && e > energyThresh && !isNaN(f["mfcc"][0]))	{
			intervalMfcc.push(f["mfcc"]);
			clock_started = true;
			console.log('recording now');
			// start = new Date();
		}
		else if (clock_started == true && intervalMfcc.length < intervalSize) {
			intervalMfcc.push(f["mfcc"]);
		}
		else if (clock_started == true && intervalMfcc.length == intervalSize) {
			intervalMfcc.push(f["mfcc"]);					// Last MFCC vector in the interval
			clock_started = false;
			label = classifySound();						// This function takes care of emptying the intervalMfcc array
			document.getElementById('audio_label').innerHTML = label;
			document.getElementById('pic_label').setAttribute("src", "../img/"+label+".jpg");
			// end = new Date();
			// var timeDiff = end - start;
			restoreDOM();
		}
		// console.log(clock_started);
		// console.log(intervalMfcc.length);
	}, sampleRate);											// Interval of extraction
}

// http://stackoverflow.com/questions/22724685/why-is-my-synchronous-code-using-settimeout-behaving-asynchronous-in-javascript
function restoreDOM () {
	var te = jStat.mean(trailingEnergy);
	if (te < energyThresh) {
		document.getElementById('audio_label').innerHTML = 'room';
		document.getElementById('pic_label').setAttribute("src", "../img/room.jpg");
	}
	else {		
		setTimeout( restoreDOM, 5000);
	}
}

function classifySound() {
	var frames = intervalMfcc.length;
	console.log('frames:' + frames);
	// Coefficient arrays: each array contains frame values for given coefficient
	var c1 = []; var c2 = []; var c3 = []; var c4 = []; var c5 = []; var c6 = []; 
	var c7 = []; var c8 = []; var c9 = []; var c10 = []; var c11 = []; var c12 = []; 
	var c13 = [];

	// Array of coefficient arrays
	var coeffs = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13];
	
	for (var i = 0; i < frames; i++) {	// Loop through all frames
		for (var j = 0; j < 13; j++) {	// Loop through all coefficients in frame
			frame = intervalMfcc[i];	// Frame is array of 13 coefficients
			coeffs[j].push(frame[j]);
		}
	}
	
	var test_data = [];
	for (var i = 0; i < 13; i++) {
		test_data.push(jStat.mean(coeffs[i]));
	}
	for (var i = 0; i < 13; i++) {
		test_data.push(jStat.stdev(coeffs[i]));
	}
	
	var testlabels = svm.predict([test_data]);				// Barking vs rest
	var testlabels2 = svm2.predict([test_data]);			// Glass vs rest
	// var testlabels3 = svm3.predict([test_data]);			// Gunshots vs rest

	console.log(testlabels);
	console.log(testlabels2);
	// console.log(testlabels3);
	
	var results = [testlabels, testlabels2]; //, testlabels3
	var max_id = 0;
	for (var i = 0; i < results.length; i++) {
		if (results[i] >= results[max_id]) {
			max_id = i;
		}
	}
	console.log('max_id:' + max_id);
	
	// var currentSound = 'testing';

	if (max_id == 0) { currentSound = 'dogs'; }
	else if (max_id == 1) { currentSound = 'glass'}

	console.log('currentSound: ' + currentSound);
	intervalMfcc = [];										// Re-initialize array
	return currentSound;

}