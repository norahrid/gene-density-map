// Draws the genes on a map using the json'ed gff file

var fname = "../assets/gffOutput-min.json";

var gffInfo;

var WIDTH;
var HEIGHT;

var chromosomeMaxPosition;

var totalGeneCount = 0;

var totalGeneCountDisplayed = 0;

var test = [];

var scaleFactor = 1;



// var chromosomes = [];

function preload() {
	// Get the json file with the gff data -- creates an object
	gffInfo = loadJSON(fname);

}

function setup() {

	pixelDensity(4);
	// WIDTH = pixelDensity() * displayWidth;
	// HEIGHT = pixelDensity * displayHeight;

	createCanvas(windowWidth, windowHeight);
	background(0);

	// For each chromosome, find the largest end position
	chromosomeMaxPosition = mapLargestPosition();

	// Do some counting for later logic checks
	var countByChromo = {};
	for (var key in gffInfo) {
		totalGeneCount += 1;

		var chromoID = gffInfo[key]["chromosomeId"];
		// chromosomes.push(chromoID);

		if (countByChromo.hasOwnProperty(chromoID)) {
			countByChromo[chromoID] += 1
		}
		else {
			countByChromo[chromoID] = 1
		}
	}

	// Lag is painful with regular redraws
	noLoop();
}

function draw() {

	background(0);

	scale(scaleFactor);

	drawChromosome("at1", 100);
	drawChromosome("at2", 150);
	drawChromosome("at3", 200);
	drawChromosome("at4", 250);
	drawChromosome("at5", 300);


	print("Total genes: ", totalGeneCount);
	// print("Total genes drawn: ", totalGeneCountDisplayed);

	// print("Max end position: ", max(test));
	// print("Display width: ", displayWidth);

}

function keyPressed() {
	// Press i to zoom in
	if (keyCode === 73) {
		scaleFactor *= 1.05;
	}
	// Press d to zoom out
	else if (keyCode === 68) {
		scaleFactor *= 0.95;
	}

	// Redraws with the new scale
	redraw();

}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}



function drawChromosome(chromoID, baseline) {
	for (var key in gffInfo) {
		// Draw the gene if it belongs to the spec. chromosome
		if (gffInfo[key]["chromosomeId"] === chromoID) {

			// Display chromosome ID
			textSize(12);
			fill(255);
			text(chromoID, 50, baseline-10);

			// To scale the positions to a value bewtween 0 and 1 so they appear on the screen
			var start = gffInfo[key]["start"]/chromosomeMaxPosition[chromoID];
			var end = gffInfo[key]["end"]/chromosomeMaxPosition[chromoID];
			drawGene(start, end, baseline);

		}

	}

}

function drawGene(start, end, baseline) {

	fill(0, 255, 0, 127);

	// Don't want an obvious stroke outline
	strokeWeight(0);
	stroke(0, 255, 0, 127);

	var startPos = start * windowWidth;
	var width = (end - start)*windowWidth;

	//rect(start/WIDTH + 10, baseline, (end - start)/WIDTH, 20);
	rect(startPos, baseline, width, 20);

	// test.push(startPos+width);

	// if (startPos + width <= displayWidth && startPos >= 0) {
	// 	totalGeneCountDisplayed += 1
	// } 

}

function findLargestPosition(chromoId) {
	ends = [];

	// Find the largest position for the spec. chromosome
	for (var key in gffInfo) {

		if (gffInfo[key]["chromosomeId"] === chromoId) {
			ends.push(gffInfo[key]["end"]);
			
		}

	}
	return max(ends);
}

function mapLargestPosition() {

	var chromoPos = {};

	var chromosomes = ["at1", "at2", "at3", "at4", "at5"];

	// For each chromosome, find its largest end position + save to a dict
	for (let i=0; i<chromosomes.length; i++) {

		var largestPos = findLargestPosition(chromosomes[i]);
		chromoPos[chromosomes[i]] = largestPos;

	}

	return chromoPos;

}

// Not in use -- using a Gene class took too long to process and run
class Gene {
	constructor(chromosomeId, geneId, start, end) {
		this.chromosomeId = chromosomeId;
		this.geneId = geneId;
		this.geneStart = start;
		this.geneEnd = end; 
	}

	display() {

		fill(0, 255, 0, 10);
		strokeWeight(0);
		stroke(0, 255, 0, 10);

		rect(this.geneStart*windowWidth, 100, (this.geneEnd - this.geneStart)*windowWidth, 20);
	}

}