var fname = "../assets/gffOutput.json";

// var pg1, pg2, pg3, pg4, pg5;

var pg, pg3;

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

var slider;

var selectedChromosome = "at1";

var chromosomeColours = {
    "at1": {"r": 254, "g": 176, "b": 120}, 
    "at2": {"r": 241, "g": 96, "b": 93}, 
    "at3": {"r": 183, "g": 55, "b": 121}, 
    "at4": {"r": 114, "g": 31, "b": 129}, 
    "at5": {"r": 44, "g": 17, "b": 95}
};


function preload() {
	// Get the json file with the gff data -- creates an object
	gffInfo = loadJSON(fname);
}

function setup() {

    frameRate(24);

    createCanvas(windowWidth, windowHeight);
    background(245);

    componentWidth = (windowWidth)/5;
    componentHeight = 50;

    slider = new Slider(25, 25, 20, 20);

    // Create a list of off screen buffers -- one for each chromosome
    for (let i=0; i<chromoNum; i++) {
        var g = createGraphics(componentWidth, componentHeight);
        graphics.push(g);
    }

    pg = createGraphics(windowWidth, componentHeight);
    pg3 = createGraphics(windowWidth, componentHeight);


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

    background(backgroundCol);

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

    // add chromosome labels

    for (let i=0; i<chromosomes.length; i++) {
        textSize(12);
        fill(0);
        text(chromosomes[i], componentWidth*i + 25, 75);
    }

    if (selectedChromosome === null) {
        drawSecondView("at1");
    }
    else {
        drawSecondView(selectedChromosome);
    }

    
    for (let i=0; i<genes.length; i++) {
        //print(selectedChromosome);


        if (genes[i].chromosomeId === selectedChromosome) {
            var start = genes[i].getStartCoord(windowWidth);
            var end = start + genes[i].getWidth(windowWidth);
            slider.determineSelected(genes[i].geneId, start, end);
        }
    }
    slider.drawThirdView();

}

function mouseClicked() {

    // Only check x coord if y coord is on the chromo map
    if (mouseY >= 25 && mouseY <= 45) {

        for (let i=0; i<=chromoNum; i++) {
            if (mouseX >= componentWidth*i && mouseX <= componentWidth*(i+1)) {
                //var id = "at" + (i+1);
                selectedChromosome = "at" + (i+1);
                drawSecondView(selectedChromosome);
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

    slider.display();

    image(pg, 0, 100);
}

function mousePressed() {

    // updated selected chromo
    setSelectedChromosome(mouseX, mouseY, 25, 45);

    if (mouseX <= (slider.left + slider.width) && mouseX >= (slider.left)) {

        // mouseX and mouseY are on the og canvas, so have to factor the img's top Y coord
        if (mouseY <= (slider.top + slider.height) + 100 && mouseY >= slider.top + 100) {
            slider.selected = true;
        }
    }
}

function mouseDragged() {
    if (slider.selected === true) {

        slider.move(mouseX);

        //slider.left = mouseX;

        redraw();

    }
}

function mouseReleased() {

    slider.resetSelectedGenes();
    setSelectedChromosome(mouseX, mouseY, 25, 45);
    print(selectedChromosome);

    for (let i=0; i<genes.length; i++) {
        //print(selectedChromosome);


        if (genes[i].chromosomeId === selectedChromosome) {
            var start = genes[i].getStartCoord(windowWidth);
            var end = start + genes[i].getWidth(windowWidth);
            slider.determineSelected(genes[i].geneId, start, end);
        }
    }

    slider.drawThirdView();

    //print(slider.genes);
    // slider is not selected
    slider.selected = false;

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
        var alpha = 150;

        // colour the gene depending on the chromosome it's part of
        // if (this.chromosomeId === "at1") buffer.fill(254, 176, 120, alpha);
        // else if (this.chromosomeId === "at2") buffer.fill(241, 96, 93, alpha);
        // else if (this.chromosomeId === "at3") buffer.fill(183, 55, 121, alpha);
        // else if (this.chromosomeId === "at4") buffer.fill(114, 31, 129, alpha);
        // else if (this.chromosomeId === "at5") buffer.fill(44, 17, 95, alpha);

        var colKey = chromosomeColours[this.chromosomeId]
        buffer.fill(colKey["r"], colKey["g"], colKey["b"], alpha);

        buffer.strokeWeight(0);

        var startPos = this.getStartCoord(w);
        var geneWidth = this.getWidth(w);
    
		buffer.rect(startPos, baseline, geneWidth, 20);
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
        pg.fill(224, 224, 224, 100);
    
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
        pg3.fill(colKey["r"], colKey["g"], colKey["b"], 150);

    
        for (let i=0; i<this.genes.length; i++) {
            var s = (this.genes[i].start - this.left)/this.width;
            var width = (this.genes[i].end - this.genes[i].start)/this.width;

            fill(255, 0, 0);
            pg3.rect(s*windowWidth, baseline, width*windowWidth, 20);
        }


        image(pg3, 0, 200);
    }


}