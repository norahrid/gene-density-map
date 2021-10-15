import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour,baseline, chromosomeNumber, backgroundTextColour } from "../constants";

const AllChromosomes = props => {

    const containerRef = useRef();

    const Sketch = (p) => {
        var graphics;
        var fullScreenWidth;
        var componentWidth;

        p.setup = () => {
            p.createCanvas(p.windowWidth, componentHeight);

            fullScreenWidth = p.windowWidth - margin;

            componentWidth = fullScreenWidth/chromosomeNumber;

            p.noLoop();
        }

        p.draw = () => {
            p.background(backgroundColour);

            graphics = [];
            // first view to show all the chromosomes on one line
            for (let i=0; i<chromosomeNumber; i++) {
                var g = p.createGraphics(componentWidth, componentHeight);
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
                    componentWidth, 
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
                p.image(graphics[i], (componentWidth*i) + 10, 0);
            }
        }

        p.mouseClicked = () => {
            // Only check x coord if y coord is on the chromo map
            if (p.mouseY >= baseline*2 && p.mouseY <= (baseline*2) + geneHeight) {
                for (let i=0; i<=chromosomeNumber; i++) {
                    if (p.mouseX >= componentWidth*i && p.mouseX <= componentWidth*(i+1)) {
                        var selectedChromosome = "at" + (i+1);
                        props.firstViewToParent(selectedChromosome);
                    }
                }
            }
        }

        function getStartCoord(gene, w) {
            return (gene.geneStart/props.chromosomeMaxPosition[gene.chromosomeId]) * w;
        }
    
        function getWidth(gene, w) {
            return ((gene.geneEnd - gene.geneStart)/props.chromosomeMaxPosition[gene.chromosomeId]) * w;
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