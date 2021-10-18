import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour, baseline, backgroundTextColour } from "../constants";

const SingleChromosome = props => {

    const containerRef = useRef();

    const Sketch = (p) => {

        var fullScreenWidth;
        //var selectedChromosome;
        var cnv;
        var pg2;
        var slider;

        p.setup = () => {
            cnv = p.createCanvas(p.windowWidth, componentHeight);
            fullScreenWidth = p.windowWidth - margin;

            slider = new Slider(props.sliderPosition, baseline, geneHeight, geneHeight);

            p.noLoop();
        }

        p.draw = () => {
            p.background(backgroundColour);

            slider.resetSelectedGenes();
            //setSelectedChromosome(p.mouseX, p.mouseY, props.styling.baseline*2, (props.styling.baseline*2)+props.styling.geneHeight);
            selectGenes();
            //p.print('after ', slider.genes);
            props.secondViewToParentGenes(slider.genes);

            // second view to show the one selected chromosome
            pg2 = p.createGraphics(fullScreenWidth, componentHeight);

            //p.print('chromo ', selectedChromosome);

            // 2nd view
            drawSecondView(props.genes, 
                backgroundColour, 
                geneHeight, 
                chromosomeColours, 
                alphaNum, 
                margin
            );
        }

        p.mousePressed = () => {
            // update selected chromo
            //setSelectedChromosome(p.mouseX, p.mouseY, props.styling.baseline*2, (props.styling.baseline*2)+props.styling.geneHeight);

            if (p.mouseX <= (slider.left + slider.width) && p.mouseX >= (slider.left)) {
                // mouseX and mouseY are on the og canvas, so have to add in the img's top Y coord
                if (p.mouseY <= (slider.top + slider.height) + baseline && p.mouseY >= slider.top + baseline) {
                    slider.setSelected();
                }
            }
            p.redraw();
        }

        p.mouseDragged = () => {
            if (slider.selected === true) {
                slider.move(p.mouseX);
                props.secondViewToParentSlider(p.mouseX);
                p.redraw();
            }
        }

        p.mouseReleased = () => {
            // p.print('released');
            // // done dragging the slider
            // //if (slider.selected === true) {
            // slider.resetSelectedGenes();
            // //p.print('b4 ', slider.genes);
            // //setSelectedChromosome(p.mouseX, p.mouseY, props.styling.baseline*2, (props.styling.baseline*2)+props.styling.geneHeight);
            // selectGenes();
            // //p.print('after ', slider.genes);
            // props.secondViewToParentGenes(slider.genes);
        
            // slider is no longer selected
            slider.unsetSelected();
            //}

            p.redraw();

        }

        function drawSecondView(genes, bgCol, gHeight, colours, alphaWeight, margin) {
            pg2.background(bgCol);

            for (let i=0; i<genes.length; i++) {
                if (genes[i].chromosomeId === props.selectedChromosome) {
                    display(genes[i], pg2, fullScreenWidth, gHeight, colours, alphaWeight);
                }
            }
        
            pg2.fill(backgroundTextColour);
            pg2.text("Chromosome: " + props.selectedChromosome, 25, baseline-10);
        
            slider.display();

            var intervals = setIntervals(props.chromosomeMinPosition[props.selectedChromosome], props.chromosomeMaxPosition[props.selectedChromosome], 7);
            var v2Scale = new ScaleLine(intervals, pg2);
            v2Scale.display(geneHeight + (2*baseline));
        
            p.image(pg2, margin/2, 0);
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
                    var start = getStartCoord(props.genes[i], fullScreenWidth);
                    var end = start + getWidth(props.genes[i], fullScreenWidth);
                    slider.determineSelected(props.genes[i].geneId, start, end);
                }
            }
           // p.print(slider.genes);
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
                pg2.fill(224, 224, 224, 25);
            
                pg2.strokeWeight(1);
                pg2.stroke(0);
        
                pg2.rect(this.left, this.top, this.width, this.height);
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
        
                if ((this.left + this.width) + dx < fullScreenWidth && this.left + dx >= 0) {
                    this.left += dx;
                }
                // prevent the slider from going off the right end
                else if (this.left + this.width + dx >= fullScreenWidth) {
                    this.left = (fullScreenWidth - this.width);
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
                // p.print(gStart);
                // p.print(gEnd);
                // p.print(this.left);
                // p.print(this.left + this.width);
                // p.print('\n');
                if (gStart >= this.left && gEnd <= (this.left + this.width)) {
                    this.genes.push({"id": id, "start": gStart, "end": gEnd});
                    //p.print('hit');
                }
            }
        
            getClickedGene(g, x) {
                var start = (g.geneStart - this.left)/this.width;
                var end = (g.geneEnd - this.left)/this.width;
        
                
                if (x >= start && x <= end) {
                    p.print('hit ', g.geneId, g.geneStart, g.geneEnd);
                }
            }
        }

        class ScaleLine {
            constructor(intervals, buffer) {
                this.positions = intervals;
                this.buffer = buffer;
            }
        
            display(topPos) {
        
                // styling
                pg2.stroke(backgroundTextColour);
                pg2.strokeWeight(1);
                pg2.textSize(10);
                pg2.fill(backgroundTextColour);
        
                var maxEnd = p.max(this.positions);
                var yPos = topPos;
        
                var shiftAmt;
                var actualPos;
                var label;
        
                for (let i=0; i<this.positions.length; i++) {
                    // relative position -- i.e., where to put the label
                    actualPos = (this.positions[i]/maxEnd) * fullScreenWidth;
                    // the og position of the gene listed in the gff file
                    label = parseInt(this.positions[i]);
        
                    // determine amount have to shift text labels so they're visible
                    if (i === this.positions.length-1) {
                        shiftAmt = -47;
                    }
                    else {
                        shiftAmt = 0;
                    }
                    pg2.line(actualPos, yPos - 20, actualPos, yPos - 10);
                    pg2.text(label, actualPos + shiftAmt, yPos);
                }
                pg2.line(0, yPos-15, fullScreenWidth + 10, yPos-15);
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