// Draws the genes on a map using the json'ed gff file

var cnv;

var fname = "../assets/gffOutput.json";

var chromoNum = 5;

var genes = [];

var slider;

// biggest position calculations
var maxEndPos;
var endPos = [];
var chromosomeMaxPosition;
var chromosomeMinPosition;

// Styling and arrangement
var margin = 20;
var backgroundCol = 245;
var baseline = 25;
var geneHeight = 75;
var a = 150;
var imgTop = 100 + (2*baseline);
var componentWidth;
var fullScreenWidth;
var componentHeight = 100;
var chromosomeColours = {
    "at1": {"r": 254, "g": 176, "b": 120}, 
    "at2": {"r": 241, "g": 96, "b": 93}, 
    "at3": {"r": 183, "g": 55, "b": 121}, 
    "at4": {"r": 114, "g": 31, "b": 129}, 
    "at5": {"r": 44, "g": 17, "b": 95}
};

// Offscreen buffers
var graphics = [];
var pg, pg3, pg4;

// default when page loads
var selectedChromosome = "at1";

var clickedGenes = [];

var minPos;

var doubleClickedGene;


// ========================================

function preload() {
	// Get the json file with the gff data -- creates an object
	gffInfo = loadJSON(fname);
}

function setup() {

    frameRate(24);

    cnv = createCanvas(windowWidth, windowHeight);
    background(backgroundCol);

    fullScreenWidth = windowWidth - margin;

    componentWidth = fullScreenWidth/chromoNum;

    // for the second view
    slider = new Slider(baseline, baseline, geneHeight, geneHeight);

    // get each chromosome's smallest and largest gene position
    chromosomeMaxPosition = mapPosition(true);
    chromosomeMinPosition = mapPosition(false);

    for (var key in gffInfo) {
        // Collect all of the end positions
        // endPos.push(gffInfo[key]["end"]);

        // make an array of all of the genes
        genes.push(new Gene(
            gffInfo[key]["chromosomeId"],
            key, 
            gffInfo[key]["start"], 
            gffInfo[key]["end"])
        );

    }

    // cnv.mouseOver(showInfo);

    // add chromosome labels
    // for (let i=0; i<chromoNum; i++) {
    //     textSize(12);
    //     fill(169);
    //     text("at" + (i+1), componentWidth*i + margin, 0);
    // }
    //maxEndPos = max(endPos);

    noLoop();
}

function draw() {
    background(backgroundCol);

    graphics = [];
    // first view to show all the chromosomes on one line
    for (let i=0; i<chromoNum; i++) {
        var g = createGraphics(componentWidth, componentHeight);
        graphics.push(g);
    }

    // second view to show the one selected chromosome
    pg = createGraphics(fullScreenWidth, componentHeight);

    // third view to show the zoomed-in portion of the chromosome under the slider box
    pg3 = createGraphics(fullScreenWidth, componentHeight);

    pg4 = createGraphics(fullScreenWidth, componentHeight+35);
    

    // set the background colour for each off screen buffer
    for (let i=0; i<graphics.length; i++) {
        graphics[i].background(backgroundCol);
    }

    for (let i=0; i<genes.length; i++) {
        // buffers are stored to correspond to the chromosome id (formatted as at#)
        var index = parseInt(genes[i].chromosomeId.slice(-1)) - 1;
        genes[i].display(baseline, graphics[index], componentWidth);
    }

    // add chromosome labels
    for (let i=0; i<chromoNum; i++) {
        graphics[i].textSize(12);
        graphics[i].fill(169);
        graphics[i].text("at" + (i+1), 20, 10);
    }
    

    // Put the image on the canvas
    for (let i=0; i<graphics.length; i++){
        image(graphics[i], (componentWidth*i) + 10, 25);
    }

    
    // 2nd view
    drawSecondView(selectedChromosome);

    var v2Scale = new ScaleLine(setIntervals(chromosomeMinPosition[selectedChromosome],chromosomeMaxPosition[selectedChromosome], 7), pg);
    v2Scale.display(imgTop, false);

    // 3rd view
    slider.resetSelectedGenes();
    selectGenes();
    //print(slider.genes);

    slider.drawThirdView(); 

    drawFourthView();

    
    if (typeof doubleClickedGene !== 'undefined') {
        // var v4Scale = new ScaleLine([gffInfo[doubleClickedGene.id].start, gffInfo[doubleClickedGene.id].end], pg4);
        var v4Scale = new ScaleLine([], pg4);
        v4Scale.display(imgTop*3, false);
    
    }



    var leftSide = (slider.left/fullScreenWidth) * chromosomeMaxPosition[selectedChromosome];
    var rightSide = ((slider.left + slider.width)/fullScreenWidth) * chromosomeMaxPosition[selectedChromosome];

    var startPos = (slider.left - slider.left)/slider.width;
    var endPos = ((slider.left + slider.width)-slider.left)/slider.width

    // print(startPos);
    // print(endPos * chromosomeMaxPosition[selectedChromosome]);
    // print(slider.left + slider.width);
    // print(rightSide);

    var v3Scale = new ScaleLine([slider.left, slider.left + slider.width], pg3);
    //print(v3Scale.positions);
    v3Scale.display(imgTop*2, true);
    // image(pg3, margin/2, 2*imgTop);


}

// Interactivity =============================

function mouseClicked() {


    // Only check x coord if y coord is on the chromo map
    if (mouseY >= baseline*2 && mouseY <= (baseline*2) + geneHeight) {
        clickedGenes = [];
        for (let i=0; i<=chromoNum; i++) {
            if (mouseX >= componentWidth*i && mouseX <= componentWidth*(i+1)) {
                selectedChromosome = "at" + (i+1);
                //drawSecondView(selectedChromosome);
            }
        }
    }
    
    if (mouseY >= baseline*2 + (2*imgTop) && mouseY <= (baseline*2) + (2*imgTop) + geneHeight) {
        
        var convertedX = ((mouseX/fullScreenWidth) * slider.width) + slider.left;
    
        for (let j=0; j<slider.genes.length; j++) {
            //print('start ', slider.genes[j].start)
            if (convertedX >= slider.genes[j].start - 0.5 && convertedX <= slider.genes[j].end + 0.5) {
                clickedGenes.push(slider.genes[j]);
                //print(slider.genes[j].id);
            }

            
        }
    }


    redraw();
}

function mousePressed() {
    // update selected chromo
    setSelectedChromosome(mouseX, mouseY, baseline*2, (baseline*2)+geneHeight);

    if (mouseX <= (slider.left + slider.width) && mouseX >= (slider.left)) {
        // mouseX and mouseY are on the og canvas, so have to add in the img's top Y coord
        if (mouseY <= (slider.top + slider.height) + imgTop + baseline && mouseY >= slider.top + imgTop + baseline) {
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
    setSelectedChromosome(mouseX, mouseY, baseline*2, (baseline*2)+geneHeight);

    selectGenes();
    slider.drawThirdView();

    // slider is no longer selected
    slider.selected = false;

}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);

    fullScreenWidth = windowWidth - margin;
    componentWidth = fullScreenWidth/chromoNum;

    redraw();
}

function doubleClicked() {
    if (mouseY >= baseline*2 + (3*imgTop) && mouseY <= (baseline*2) + (3*imgTop) + geneHeight) {
        for (let i=0; i<clickedGenes.length; i++) {
            var start = (clickedGenes[i].start - (minPos - 0.15)) * 1000;
            var width = (clickedGenes[i].end - clickedGenes[i].start) * 1000;
            if (mouseX >= start && mouseX <= start + width) {
                doubleClickedGene = clickedGenes[i];
                print('HIT ', clickedGenes[i].id);
            }
        }
        //print(mouseY);
    }
    redraw();
}
// Helper functions ================================================

function findMinMaxPosition(chromoId, isMax) {
	pos = [];

	// Find the largest position for the spec. chromosome
	for (var key in gffInfo) {
        if (gffInfo[key]["chromosomeId"] === chromoId) {
            // get the max pos
            if (isMax) {
                pos.push(gffInfo[key]["end"]);
            }
            // get the min pos
            else {
                pos.push(gffInfo[key]["start"]);   
            } 
        }
	}
    if (isMax) return max(pos);
    else return min(pos);

}

function mapPosition(isMax) {

	var chromoPos = {};

	var chromosomes = ["at1", "at2", "at3", "at4", "at5"];

	// For each chromosome, find its smallest/largest position + save to a dict
	for (let i=0; i<chromosomes.length; i++) {
            chromoPos[chromosomes[i]] = findMinMaxPosition(chromosomes[i], isMax);
	}
	return chromoPos;
}

function drawSecondView(id) {
    pg.background(backgroundCol);
    //background(backgroundCol);

    for (let i=0; i<genes.length; i++) {
        if (genes[i].chromosomeId === id) {
            genes[i].display(baseline, pg, fullScreenWidth); 
        }
    }

    pg.fill(169);
    pg.text("Chromosome: " + selectedChromosome, 25, 15);

    slider.display();

    image(pg, margin/2, imgTop+25);
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

function setIntervals(start, end, intervalNum) {

    //print(start);

    var intervalSize = end/intervalNum

    var intervals = [];

    for (let i=start; i<=end; i+=intervalSize) {
        intervals.push(i);
    }

    intervals.push(end);
    //print(intervals);
    return intervals;
}

function drawFourthView() {

    pg4.background(240);

    if (clickedGenes.length === 0) {
        pg4.fill(255, 0, 0);
        pg4.text("Nothing yet", 10, 50);
    }

    else {
        var colKey = chromosomeColours[selectedChromosome];
        pg4.fill(colKey["r"], colKey["g"], colKey["b"], a);
        fill(colKey["r"], colKey["g"], colKey["b"], a);

   
        strokeWeight(0);

        var pos = [];
        for (let i=0; i<clickedGenes.length; i++) {
            pos.push(clickedGenes[i].start);
        }

        minPos = min(pos);
        //print(minPos);



        for (let i=0; i<clickedGenes.length; i++) {
            var start = (clickedGenes[i].start - (minPos - 0.15)) * 1000;
            var width = (clickedGenes[i].end - clickedGenes[i].start) * 1000;

            // var start = ((clickedGenes[i].start - slider.left)/slider.width);
            // var width = ((clickedGenes[i].end - clickedGenes[i].start)/slider.width);

            // print(start, start + width);
            // print(fullScreenWidth);

            //print(genes[i]);

            print(doubleClickedGene);

            if (doubleClickedGene === clickedGenes[i]) {
                pg4.fill(169);
                pg4.stroke(169);
                pg4.strokeWeight(1);
                print(doubleClickedGene);
                pg4.text("Selected gene: " + doubleClickedGene.id, 10, 25);
                pg4.text(gffInfo[doubleClickedGene.id].start, start-40, baseline+geneHeight + 25);
                pg4.text(gffInfo[doubleClickedGene.id].end, start+width, baseline+geneHeight + 25);
                pg4.line(start, baseline+geneHeight+5, start, baseline+geneHeight+15);
                pg4.line(start+width, baseline+geneHeight+5, start+width, baseline+geneHeight+15);

                

                
                var colKey = chromosomeColours[selectedChromosome];
                pg4.fill(colKey["r"], colKey["g"], colKey["b"], a);


                //print(gffInfo);
                

            }
            else {
                pg4.fill(200);
            }
            pg4.strokeWeight(0);
            // var start = (clickedGenes[i].start - (minPos - 0.15)) * 1000;
            // var width = (clickedGenes[i].end - clickedGenes[i].start) * 1000;
            pg4.rect(start, baseline+5, width, geneHeight);

            //rect(start, (3*imgTop)+baseline + baseline, width, geneHeight);
        }
    }

    //print(clickedGenes);

    image(pg4, margin/2, (3*imgTop)+baseline);


}

// function showInfo() {
//     print(mouseX, mouseY);

// }

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
        //slider.left += dx;

        if ((slider.left + slider.width) + dx < fullScreenWidth && slider.left + dx >= 0) {
            slider.left += dx;
        }
        // prevent the slider from going off the right end
        else if (slider.left + slider.width + dx >= fullScreenWidth) {
            slider.left = (fullScreenWidth - slider.width);
        }
        // prevents slider from going off left end
        else if (slider.left + dx < 0) {
            slider.left = 0;
        }
        
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
        // background(backgroundCol);
        pg3.background(backgroundCol);
        
        //print(this.genes);
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
        pg3.textSize(12);
        pg3.text("Subregion: " + selectedChromosome, margin, baseline-10);

        //pg3.strokeWeight(1);



        //pg3.line(margin/2, baseline + geneHeight + 5, fullScreenWidth, baseline + geneHeight + 5);

        image(pg3, margin/2, (2*imgTop)+baseline);
    }

    getClickedGene(g, x) {
        var start = (g.geneStart - this.left)/this.width;
        var end = (g.geneEnd - this.left)/this.width;

        
        if (x >= start && x <= end) {
            print('hit ', g.geneId, g.geneStart, g.geneEnd);
        }
    }

    getMinMax(isMax) {
        var pos = [];

        for (let i=0; i<this.genes.length; i++) {
            if (isMax) {
                pos.push(this.genes[i].end);
            }
            else {
                pos.push(this.genes[i].start);
            }
        }

        if (isMax) {
            return max(pos);

        }
        else {
            return min(pos);
        }
    }

}

class ScaleLine {
    constructor(intervals, buffer) {
        this.positions = intervals;
        this.buffer = buffer;
    }

    display(topPos, customPos) {

        // styling
        stroke(169);
        strokeWeight(1);
        textSize(10);
        fill(169);

        var maxEnd = max(this.positions);
        var yPos = topPos + componentHeight + baseline*2;

        var shiftAmt;
        var actualPos;
        var label;

        for (let i=0; i<this.positions.length; i++) {
            if (customPos) {
                actualPos = ((this.positions[i] - slider.left) / slider.width ) * fullScreenWidth;

                // TODO: temp fix-- find a better way
                if (slider.left === 0) {
                    label = max(parseInt((this.positions[i]/fullScreenWidth) * chromosomeMaxPosition[selectedChromosome]), chromosomeMinPosition[selectedChromosome]);
                }
                else {
                    label = parseInt((this.positions[i]/fullScreenWidth) * chromosomeMaxPosition[selectedChromosome]);
                }
            }
            else {
                actualPos = (this.positions[i]/maxEnd) * fullScreenWidth;
                label = parseInt(this.positions[i]);
            }


            if (i === this.positions.length-1) {
                shiftAmt = -30;
                // line(actualPos+10, yPos-20, actualPos + 10, yPos-10);
                // text(this.positions[i], actualPos - 30, (imgTop ) + 150);
            }
            else {
                shiftAmt = 5;
                // line(actualPos + 10, yPos-20, actualPos+ 10, yPos-10);
                // text(this.positions[i], actualPos + 5, (imgTop) + 150);
            }

            line(actualPos + 10, yPos - 20, actualPos + 10, yPos - 10);
            text(label, actualPos + shiftAmt, yPos);
        }

        line(margin/2, yPos-15, fullScreenWidth + 10, yPos-15);
        // this.buffer.line(margin/2, baseline + geneHeight + 5, margin/2, baseline + geneHeight + 15);
        // this.buffer.line(fullScreenWidth, baseline + geneHeight + 5, fullScreenWidth, baseline + geneHeight + 15);
    }
}