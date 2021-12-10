import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour,baseline, chromosomeNumber, backgroundTextColour,
    componentWidth, chunkWidth } from "../constants";
import { getStartCoord, getWidth } from "../helpers/CalculatePosition";

const AllChromosomes = props => {

    const containerRef = useRef();

    const Sketch = (p) => {
        var graphics;
        //var fullScreenWidth;

        p.setup = () => {
            p.createCanvas(componentWidth, componentHeight);

            //fullScreenWidth = p.windowWidth - margin;
            p.print(componentWidth);

            //componentWidth = fullScreenWidth/chromosomeNumber;

            p.noLoop();

            //p.print(props.genes.length);
        }

        p.draw = () => {
            p.background(backgroundColour);

            graphics = [];
            // first view to show all the chromosomes on one line
            for (let i=0; i<chromosomeNumber; i++) {
                var g = p.createGraphics(chunkWidth, componentHeight);
                graphics.push(g);
            }

            // set the background colour for each off screen buffer
            for (let i=0; i<graphics.length; i++) {
                graphics[i].background(backgroundColour);
            }


            for (let i=0; i<props.genes.length; i++) {
                // buffers are stored to correspond to the chromosome id (formatted as at#)
                var index = parseInt(props.genes[i].chromosomeId.slice(-1)) - 1;
                display(props.genes[i], 
                    graphics[index], 
                    chunkWidth, 
                    geneHeight, 
                    chromosomeColours, 
                    alphaNum
                );
            }

            // add chromosome labels
            for (let i=0; i<chromosomeNumber; i++) {
                graphics[i].textSize(12);
                graphics[i].fill(backgroundTextColour);
                graphics[i].text("at" + (i+1), 20, 15);
            }

            // Put the image on the canvas
            for (let i=0; i<graphics.length; i++){
                p.image(graphics[i], (chunkWidth*i), 0);
            }
        }

        p.mouseClicked = () => {
            // Only check x coord if y coord is on the chromo map
            if (p.mouseY >= baseline*2 && p.mouseY <= (baseline*2) + geneHeight) {
                for (let i=0; i<=chromosomeNumber; i++) {
                    if (p.mouseX >= chunkWidth*i && p.mouseX <= chunkWidth*(i+1)) {
                        if (i <= chromosomeNumber-1) {
                            var selectedChromosome = "at" + (i+1);
                            props.firstViewToParent(selectedChromosome);
                            props.thirdViewToParentPtr({'thirdViewClicked': false, 'xPos': null});
                            props.thirdViewToParent([]);
                    }
                    }
                }
            }
        }
    
        function display(gene, buffer, w, gHeight, colours, alphaWeight) {
            var colKey = colours[gene.chromosomeId];
            buffer.fill(colKey["r"], colKey["g"], colKey["b"], alphaWeight);
    
            buffer.strokeWeight(0);
    
            var startPos = getStartCoord(gene, w);
            var geneWidth = getWidth(gene, w);
    
    
            buffer.rect(startPos, baseline, geneWidth, gHeight);
        }
    }

    useEffect(() => {
        let inst = new p5(Sketch, containerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        return () => inst.remove();
    }, []);

    return (
        <div ref={containerRef}> </div>
    );
}

export default AllChromosomes;