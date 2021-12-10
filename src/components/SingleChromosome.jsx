import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour, baseline, backgroundTextColour, sliderWidth, componentWidth } from "../constants";
import { drawScaleLine } from "../helpers/ScaleLine";
import { getStartCoord, getWidth } from "../helpers/CalculatePosition";
import { maxChromosomePosition, minChromosomePosition } from "../helpers/CalculateMinMaxPosition";

const SingleChromosome = props => {

    const containerRef = useRef();

    const Sketch = (p) => {

        //var fullScreenWidth;
        var pg2;
        var slider;

        p.setup = () => {
            p.createCanvas(componentWidth, componentHeight);
            //fullScreenWidth = p.windowWidth - margin;

            slider = new Slider(props.sliderPosition, baseline, geneHeight, geneHeight);

            p.noLoop();
        }

        p.draw = () => {
            p.background(backgroundColour);
            slider.resetSelectedGenes();
            selectGenes();
            props.secondViewToParentGenes(slider.genes);

            // second view to show the one selected chromosome
            pg2 = p.createGraphics(componentWidth, componentHeight);

            // 2nd view
            drawSecondView(props.genes, 
                backgroundColour, 
                geneHeight, 
                chromosomeColours, 
                alphaNum, 
                margin
            );

            slider.display();
        }

        p.mousePressed = () => {
            if (p.mouseX <= (slider.left + slider.width) && p.mouseX >= (slider.left)) {
                // mouseX and mouseY are on the og canvas, so have to add in the img's top Y coord
                if (p.mouseY <= (slider.top + slider.height) + baseline && p.mouseY >= slider.top + baseline) {
                    slider.setSelected();

                    // Need to clear the fourth view since it's not applicable with a new chromo selection
                    props.thirdViewToParentPtr({'thirdViewClicked': false, 'xPos': null});
                    props.thirdViewToParent([]);
                }
            }
            p.redraw();
        }

        p.mouseDragged = () => {
            p.background(backgroundColour);
            if (slider.selected === true) {
                
                slider.move(p.mouseX);
                // props.secondViewToParentSlider(p.mouseX);
                //p.redraw();
                p.image(pg2, 0, 0);
                slider.display();
            }
        }

        p.mouseReleased = () => {

            if (slider.selected === true) {
                let val;

                if (p.mouseX < 0) val = 0;
                else if (p.mouseX >= componentWidth) val = (componentWidth) - sliderWidth;
                else if (p.mouseX + sliderWidth >= componentWidth) val = componentWidth - sliderWidth;
                else val = p.mouseX;

                props.secondViewToParentSlider(val);
                // slider is no longer selected
                slider.unsetSelected();
                p.redraw();
            }
        }

        function drawSecondView(genes, bgCol, gHeight, colours, alphaWeight, margin) {
            pg2.background(bgCol);

            for (let i=0; i<genes.length; i++) {
                if (genes[i].chromosomeId === props.selectedChromosome) {
                    display(genes[i], pg2, componentWidth, gHeight, colours, alphaWeight);
                }
            }
        
            //pg2.fill(backgroundTextColour);
            //pg2.text("Chromosome: " + props.selectedChromosome, 25, baseline-10);
        
            //slider.display();

            var intervals = setIntervals(minChromosomePosition[props.selectedChromosome], maxChromosomePosition[props.selectedChromosome], 7);
            drawScaleLine("v2", pg2, intervals, props.sliderPosition, geneHeight+(2*baseline), props.selectedChromosome, componentWidth);
        
            p.image(pg2, 0, 0);
        }

        function display(gene, buffer, w, gHeight, colours, alphaWeight) {
            var colKey = colours[gene.chromosomeId];
            buffer.fill(colKey["r"], colKey["g"], colKey["b"], alphaWeight);
    
            buffer.strokeWeight(0);
    
            var startPos = getStartCoord(gene, w);
            var geneWidth = getWidth(gene, w);
    
            buffer.rect(startPos, baseline, geneWidth, gHeight);
        }

        function setIntervals(start, end, intervalNum) {
            var intervalSize = end/intervalNum
        
            var intervals = [];
        
            for (let i=start; i<=end; i+=intervalSize) {
                intervals.push(i);
            }
            intervals.push(end);
            return intervals;
        }

        function selectGenes() {
            //p.print('selected chromo: ', selectedChromosome);
            for (let i=0; i<props.genes.length; i++) {
                if (props.genes[i].chromosomeId === props.selectedChromosome) {
                    //p.print(genes[i]);
                    var start = getStartCoord(props.genes[i], componentWidth);
                    var end = start + getWidth(props.genes[i], componentWidth);
                    slider.determineSelected(props.genes[i].geneId, start, end);
                }
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
                p.fill(224, 224, 224, 25);
            
                p.strokeWeight(1);
                p.stroke(0);
        
                p.rect(this.left, this.top, this.width, this.height);
            }

            setSelected() {
                this.selected = true;
            }

            unsetSelected() {
                this.selected = false;
            }
        
            move(x) {
                var dx = x - this.left;
                //slider.left += dx;
        
                if ((this.left + this.width) + dx < componentWidth && this.left + dx >= 0) {
                    this.left += dx;
                }
                // prevent the slider from going off the right end
                else if (this.left + this.width + dx >= componentWidth) {
                    this.left = (componentWidth - this.width);
                }
                // prevents slider from going off left end
                else if (this.left + dx < 0) {
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
        
            getClickedGene(g, x) {
                var start = (g.geneStart - this.left)/this.width;
                var end = (g.geneEnd - this.left)/this.width;
        
                
                // if (x >= start && x <= end) {
                //     p.print('hit ', g.geneId, g.geneStart, g.geneEnd);
                // }
            }
        }
    }

    useEffect(() => {
        let inst = new p5(Sketch, containerRef.current);
        return () => inst.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.selectedChromosome]);

    return (
        <div ref={containerRef}></div>
    );
}

export default SingleChromosome;