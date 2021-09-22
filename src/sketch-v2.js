var fname = "../assets/gffOutput.json";

// var pg1, pg2, pg3, pg4, pg5;

var pg;

var maxEndPos;

var scaleFactor = 1;

var chromoNum = 5;

var endPos = [];
var genes = [];

var chromosomeMaxPosition;

var componentWidth;

var chromosomes = ["at1", "at2", "at3", "at4", "at5"];

var backgroundCol = 245;

var baseline = 25;

var graphics = [];

function preload() {
	// Get the json file with the gff data -- creates an object
	gffInfo = loadJSON(fname);
}

function setup() {

    createCanvas(windowWidth, windowHeight);
    background(245);

    componentWidth = (windowWidth)/5;
    componentHeight = 50;

    // Create a list of off screen buffers -- one for each chromosome
    for (let i=0; i<chromoNum; i++) {
        var g = createGraphics(componentWidth, componentHeight);
        graphics.push(g);
    }

    pg = createGraphics(windowWidth, componentHeight);


    // pg1 = createGraphics(componentWidth, componentHeight);
    // pg2 = createGraphics(componentWidth, componentHeight);
    // pg3 = createGraphics(componentWidth, componentHeight);
    // pg4 = createGraphics(componentWidth, componentHeight);
    // pg5 = createGraphics(componentWidth, componentHeight);
    
    chromosomeMaxPosition = mapLargestPosition();

    for (var key in gffInfo) {
        
        // Collect all of the end positions
        endPos.push(gffInfo[key]["end"]);

        // make an array of all of the genes
        genes.push(new Gene(
            gffInfo[key]["chromosomeId"],
            key, 
            gffInfo[key]["start"], 
            gffInfo[key]["end"])
        );

    }
    maxEndPos = max(endPos);
    //print(genes);
    noLoop();
}

function draw() {

    // set the background colour for each off screen buffer
    for (let i=0; i<graphics.length; i++) {
        graphics[i].background(backgroundCol);
    }

    

    // pg1.background(backgroundCol);
    // pg2.background(backgroundCol);
    // pg3.background(backgroundCol);
    // pg4.background(backgroundCol);
    // pg5.background(backgroundCol);

    // pg.scale(scaleFactor);


    for (let i=0; i<genes.length; i++) {
        // buffers are stored to correspond to the chromosome id (formatted as at#)
        var index = parseInt(genes[i].chromosomeId.slice(-1)) - 1;
        genes[i].display(baseline, graphics[index], componentWidth);

    
        // if (genes[i].chromosomeId === "at1") genes[i].display(baseline, graphics[0]);
        // if (genes[i].chromosomeId === "at2") genes[i].display(baseline, graphics[1]);
        // if (genes[i].chromosomeId === "at3") genes[i].display(baseline, graphics[2]);
        // if (genes[i].chromosomeId === "at4") genes[i].display(baseline, graphics[3]);
        // if (genes[i].chromosomeId === "at5") genes[i].display(baseline, graphics[4]);
    }

    // Put the image on the canvas
    for (let i=0; i<graphics.length; i++){
        image(graphics[i], componentWidth*i, 0);
    }

    // image(pg1, 0, 0);
    // image(pg2, componentWidth, 0);
    // image(pg3, componentWidth*2, 0);
    // image(pg4, componentWidth*3, 0);
    // image(pg5, componentWidth*4 , 0);

    for (let i=0; i<chromosomes.length; i++) {

        textSize(12);
        fill(0);
        text(chromosomes[i], componentWidth*i + 25, 75);

    }

}

function mouseClicked() {

    // Only check x coord if y coord is on the chromo map
    if (mouseY >= 25 && mouseY <= 45) {

        for (let i=0; i<=chromoNum; i++) {
            if (mouseX >= componentWidth*i && mouseX <= componentWidth*(i+1)) {
                var id = "at" + (i+1);
                drawSecondView(id);
            }
        }
    }
}

function drawSecondView(id) {

    pg.background(backgroundCol);

    for (let i=0; i<genes.length; i++) {
        if (genes[i].chromosomeId === id) {
            genes[i].display(baseline, pg, windowWidth); 
        }
    }
    image(pg, 0, 100);
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


class Gene {
	constructor(chromosomeId, geneId, start, end) {
		this.chromosomeId = chromosomeId;
		this.geneId = geneId;
		this.geneStart = start;
		this.geneEnd = end; 
	}

	display(baseline, buffer, w) {
        var alpha = 150;

        // colour the gene depending on the chromosome it's part of
        if (this.chromosomeId === "at1") buffer.fill(254, 176, 120, alpha);
        else if (this.chromosomeId === "at2") buffer.fill(241, 96, 93, alpha);
        else if (this.chromosomeId === "at3") buffer.fill(183, 55, 121, alpha);
        else if (this.chromosomeId === "at4") buffer.fill(114, 31, 129, alpha);
        else if (this.chromosomeId === "at5") buffer.fill(44, 17, 95, alpha);

        buffer.strokeWeight(0);

        var startPos = (this.geneStart/chromosomeMaxPosition[this.chromosomeId]) * w;
        var geneWidth = ((this.geneEnd - this.geneStart)/chromosomeMaxPosition[this.chromosomeId]) * w;
    
		buffer.rect(startPos, baseline, geneWidth, 20);
	}

}