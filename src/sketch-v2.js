// Draws the genes on a map using the json'ed gff file

var fname = "../assets/gffOutput.json";

var chromoNum = 5;

var genes = [];

var slider;

// biggest position calculations
var maxEndPos;
var endPos = [];
var chromosomeMaxPosition;

// Styling and arrangement
var backgroundCol = 245;
var baseline = 25;
var geneHeight = 75;
var a = 150;
var imgTop = 100 + (2*baseline);
var componentWidth;
var fullScreenWidth;
var componentHeight = 100 + baseline;
var chromosomeColours = {
    "at1": {"r": 254, "g": 176, "b": 120}, 
    "at2": {"r": 241, "g": 96, "b": 93}, 
    "at3": {"r": 183, "g": 55, "b": 121}, 
    "at4": {"r": 114, "g": 31, "b": 129}, 
    "at5": {"r": 44, "g": 17, "b": 95}
};

// Offscreen buffers
var graphics = [];
var pg, pg3;

// default when page loads
var selectedChromosome = "at1";

// ========================================

function preload() {
	// Get the json file with the gff data -- creates an object
	gffInfo = loadJSON(fname);
}

function setup() {

    frameRate(24);

    createCanvas(windowWidth, windowHeight);
    background(backgroundCol);

    fullScreenWidth = windowWidth - 20;

    componentWidth = (fullScreenWidth)/chromoNum;

    // for the second view
    slider = new Slider(baseline, baseline, geneHeight, geneHeight);

    // first view to show all the chromosome on one line
    for (let i=0; i<chromoNum; i++) {
        var g = createGraphics(componentWidth, componentHeight);
        graphics.push(g);
    }

    // second view to show the one selected chromosome
    pg = createGraphics(fullScreenWidth, componentHeight);

    // third view to show the zoomed-in portion of the chromosome under the slider box
    pg3 = createGraphics(fullScreenWidth, componentHeight);

    // get each chromosome's largest gene end position
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

    noLoop();
}

function draw() {
    background(backgroundCol);

    // set the background colour for each off screen buffer
    for (let i=0; i<graphics.length; i++) {
        graphics[i].background(backgroundCol);
    }

    for (let i=0; i<genes.length; i++) {
        // buffers are stored to correspond to the chromosome id (formatted as at#)
        var index = parseInt(genes[i].chromosomeId.slice(-1)) - 1;
        genes[i].display(baseline, graphics[index], componentWidth);
    }

    // Put the image on the canvas
    for (let i=0; i<graphics.length; i++){
        image(graphics[i], (componentWidth*i) + 10, 0);
    }

    // add chromosome labels
    for (let i=0; i<chromoNum; i++) {
        textSize(12);
        fill(169);
        text("at" + (i+1), componentWidth*i + 25, 15);
    }


    drawSecondView(selectedChromosome);

    selectGenes();
    slider.drawThirdView();

}

// Interactivity =============================

function mouseClicked() {
    // Only check x coord if y coord is on the chromo map
    if (mouseY >= baseline && mouseY <= baseline + geneHeight) {
        for (let i=0; i<=chromoNum; i++) {
            if (mouseX >= componentWidth*i && mouseX <= componentWidth*(i+1)) {
                selectedChromosome = "at" + (i+1);
                drawSecondView(selectedChromosome);
            }
        }
    }
}

function mousePressed() {
    // updated selected chromo
    setSelectedChromosome(mouseX, mouseY, baseline, baseline+geneHeight);

    if (mouseX <= (slider.left + slider.width) && mouseX >= (slider.left)) {
        // mouseX and mouseY are on the og canvas, so have to add in the img's top Y coord
        if (mouseY <= (slider.top + slider.height) + imgTop && mouseY >= slider.top + imgTop) {
            slider.selected = true;
        }
    }
    //redraw();
}

function mouseDragged() {
    if (slider.selected === true) {
        slider.move(mouseX);
        redraw();
    }
}

function mouseReleased() {
    slider.resetSelectedGenes();
    setSelectedChromosome(mouseX, mouseY, baseline, baseline+geneHeight);

    selectGenes();
    slider.drawThirdView();

    // slider is no longer selected
    slider.selected = false;

}

// Helper functions ================================================

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

function drawSecondView(id) {
    pg.background(backgroundCol);

    for (let i=0; i<genes.length; i++) {
        if (genes[i].chromosomeId === id) {
            genes[i].display(baseline, pg, fullScreenWidth); 
        }
    }

    pg.fill(169);
    pg.text("Chromosome: " + selectedChromosome, 25, baseline-10);

    slider.display();

    image(pg, 10, imgTop);
}

function setSelectedChromosome(x, y, topY, bottomY) {
    // Only check x coord if y coord is on the chromo map
    if (y >= topY && y <= bottomY) {

        for (let i=0; i<=chromoNum; i++) {
            if (x >= componentWidth*i && x <= componentWidth*(i+1)) {
                //var id = "at" + (i+1);
                selectedChromosome = "at" + (i+1);
                //print(selectedChromosome);
            }
        }
    }
}

function selectGenes() {
    for (let i=0; i<genes.length; i++) {
        if (genes[i].chromosomeId === selectedChromosome) {
            var start = genes[i].getStartCoord(fullScreenWidth);
            var end = start + genes[i].getWidth(fullScreenWidth);
            slider.determineSelected(genes[i].geneId, start, end);
        }
    }
}

// Classes ===========================================

class Gene {
	constructor(chromosomeId, geneId, start, end) {
		this.chromosomeId = chromosomeId;
		this.geneId = geneId;
		this.geneStart = start;
		this.geneEnd = end; 
	}

    getStartCoord(w) {
        return (this.geneStart/chromosomeMaxPosition[this.chromosomeId]) * w;
    }

    getWidth(w) {
        return ((this.geneEnd - this.geneStart)/chromosomeMaxPosition[this.chromosomeId]) * w;
    }

	display(baseline, buffer, w) {
        var colKey = chromosomeColours[this.chromosomeId]
        buffer.fill(colKey["r"], colKey["g"], colKey["b"], a);

        buffer.strokeWeight(0);

        var startPos = this.getStartCoord(w);
        var geneWidth = this.getWidth(w);
    
		buffer.rect(startPos, baseline, geneWidth, geneHeight);
	}
}

class Slider {
    constructor(left, top, width, height) {
        this.selected = false;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.genes = [];
    }

    display() {
        // draw slider
        pg.fill(224, 224, 224, 25);
    
        pg.strokeWeight(1);
        pg.stroke(0);

        pg.rect(this.left, this.top, this.width, this.height);
    }

    move(x) {
        var dx = x - slider.left;
        slider.left += dx;
    }

    resetSelectedGenes() {
        this.genes = [];
    }

    determineSelected(id, gStart, gEnd) {
        if (gStart >= this.left && gEnd <= (this.left + this.width)) {
            this.genes.push({"id": id, "start": gStart, "end": gEnd});
        }
    }

    drawThirdView() {
        pg3.background(backgroundCol);

        pg3.strokeWeight(0);
        var colKey = chromosomeColours[selectedChromosome];
        pg3.fill(colKey["r"], colKey["g"], colKey["b"], a);

        for (let i=0; i<this.genes.length; i++) {

            // shift all affected genes back by the slider's left position -- puts the slider's left value at 0
            var s = (this.genes[i].start - this.left)/this.width;
            var width = (this.genes[i].end - this.genes[i].start)/this.width;

            pg3.rect(s*fullScreenWidth, baseline, width*fullScreenWidth, geneHeight);
        }
        pg3.fill(169);
        pg3.text("Subregion: " + selectedChromosome, 25, baseline-10);

        image(pg3, 10, 2*imgTop);
    }
}