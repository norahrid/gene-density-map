import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour,baseline, backgroundTextColour } from "../Constants";
import gffInfo from "../gffOutput.json";

const ClickView = props => {

    const containerRef = useRef();

    const Sketch = p => {

        var fullScreenWidth;

        var doubleClickedGene;
        var minPos;
        var pg4;

        p.setup = () => {
            p.createCanvas(p.windowWidth, componentHeight);
            fullScreenWidth = p.windowWidth - margin;

            p.noLoop();
        }

        p.draw = () => {
            p.background(backgroundColour);

            pg4 = p.createGraphics(fullScreenWidth, componentHeight + baseline + 10);

            // fourth view
            drawFourthView();
        }

        p.doubleClicked = () => {
            
            if (p.mouseY >= baseline && p.mouseY <= baseline + geneHeight) {
                
                if (typeof props.clickedGenes !== 'undefined') {
                    
                    for (let i=0; i<props.clickedGenes.length; i++) {
                        // Move all selected genes to the left by the smallest start position + scale by 1000
                        var start = (props.clickedGenes[i].start - (minPos - 0.15)) * 1000;
                        var width = (props.clickedGenes[i].end - props.clickedGenes[i].start) * 1000;
                        if (p.mouseX >= start && p.mouseX <= start + width) {
                            // if gene is selected with a double click, record it
                            doubleClickedGene = props.clickedGenes[i];
                        }
                    }
                }
            p.redraw();
            }
        }

        function drawFourthView() {
            pg4.background(240);

            var cGenes;

            if (typeof props.clickedGenes === 'undefined') cGenes = [];
            else cGenes = props.clickedGenes;
            
            // No genes selected -- prompt for a click
            if (cGenes.length === 0) {
                pg4.fill(backgroundTextColour);
                pg4.textAlign(p.CENTER);
                pg4.text("Click on a subregion to select genes", (fullScreenWidth)/2, componentHeight/3);
            }
        
            else {
                // find the smallest start position of the selected genes
                var pos = [];
                for (let i=0; i<props.clickedGenes.length; i++) {
                    pos.push(props.clickedGenes[i].start);
                }
                minPos = p.min(pos);

                for (let i=0; i<props.clickedGenes.length; i++) {
                    // shift genes back to nearly the beginning so they don't disappear off screen
                    var start = (props.clickedGenes[i].start - (minPos - 0.15)) * 1000;
                    var width = (props.clickedGenes[i].end - props.clickedGenes[i].start) * 1000;
        
                    if (doubleClickedGene === props.clickedGenes[i]) {
                        // styling
                        pg4.fill(backgroundTextColour);
                        pg4.stroke(backgroundTextColour);
                        pg4.strokeWeight(1);
        
                        // display selected gene's id, og start and end
                        pg4.text("Selected gene: " + doubleClickedGene.id, 10, baseline);

                        pg4.text(gffInfo[doubleClickedGene.id].start, start-40, (baseline*2)+geneHeight);
                        pg4.text(gffInfo[doubleClickedGene.id].end, start+width, (baseline*2)+geneHeight);

                        pg4.line(start, baseline+geneHeight+5, start, baseline+geneHeight+(baseline-10));
                        pg4.line(start+width, baseline+geneHeight+5, start+width, baseline+geneHeight+(baseline-10));
                        pg4.line(0, baseline+geneHeight+10, fullScreenWidth + 10, baseline+geneHeight+10);
        
                        // get the colour of the currently selected chromosome
                        var colKey = chromosomeColours[props.selectedChromosome];
                        pg4.fill(colKey["r"], colKey["g"], colKey["b"], alphaNum);
        
                    }
                    else {
                        pg4.fill(200);
                    }
        
                    // draw gene
                    pg4.strokeWeight(0);
                    pg4.rect(start, baseline+5, width, geneHeight);
                }
            }
            p.image(pg4, margin/2, 0);
        }
    }

    useEffect(() => {
        let inst = new p5(Sketch, containerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps

        return () => inst.remove();
    }, [props.clickedGenes, props.selectedChromosome]);

    return (
        <div ref={containerRef}></div>
    );
}

export default ClickView;