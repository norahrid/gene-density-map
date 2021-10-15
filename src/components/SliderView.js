import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour,baseline, backgroundTextColour, sliderWidth } from "../constants";

const SliderView = props => {

    const containerRef = useRef();

    const Sketch = p => {

        var fullScreenWidth;
        var selectedChromosome;
        var pg3;
        var ptr;
        var clickedGenes;
        
        p.setup = () => {
            p.createCanvas(p.windowWidth, componentHeight);
            fullScreenWidth = p.windowWidth - margin;

            ptr = new Pointer();

            p.noLoop();
        }

        p.draw = () => {
            p.background(backgroundColour);

            // 3rd view to show the genes contained in the slider
            pg3 = p.createGraphics(fullScreenWidth, componentHeight);

            drawThirdView(
                backgroundColour, 
                chromosomeColours, 
                geneHeight, 
                margin, 
                alphaNum
            ); 
        }

        p.mouseReleased = () => {
            p.print(p.mouseY);
            if (p.mouseY >= baseline && p.mouseY <= baseline + geneHeight) {
                clickedGenes = [];
                ptr.setClicked(p.mouseX);
                
                var convertedX = ((p.mouseX/fullScreenWidth) * 75) + props.sliderPosition;
                for (let j=0; j<props.selectedGenes.length; j++) {
                    if (convertedX >= props.selectedGenes[j].start - 0.5 && convertedX <= props.selectedGenes[j].end + 0.5) {
                        clickedGenes.push(props.selectedGenes[j]);
                    }  
                }
            }
            // p.print(clickedGenes);
            props.thirdViewToParent(clickedGenes);

            p.redraw();
            //return false;
        }

        function drawThirdView(bgCol, colours, gHeight, margin, alphaWeight) {
            if (props.selectedChromosome === "") selectedChromosome = "at1";
            else selectedChromosome = props.selectedChromosome;

            pg3.background(bgCol);
            
            pg3.strokeWeight(0);
            var colKey = colours[selectedChromosome];
            pg3.fill(colKey["r"], colKey["g"], colKey["b"], alphaWeight);
    
            for (let i=0; i<props.selectedGenes.length; i++) {
                // shift all affected genes back by the slider's left position -- puts the slider's left value at 0
                var s = (props.selectedGenes[i].start - props.sliderPosition)/75;
                var width = (props.selectedGenes[i].end - props.selectedGenes[i].start)/75;
                pg3.rect(s*fullScreenWidth, baseline, width*fullScreenWidth, gHeight);
            }
    
            pg3.fill(backgroundTextColour);
            pg3.textSize(12);
            pg3.text("Subregion: " + selectedChromosome, margin, baseline-10);
    

            var v3Scale = new ScaleLine([props.sliderPosition, props.sliderPosition+sliderWidth], pg3);
            v3Scale.display(geneHeight + (2*baseline));

            ptr.display();

            // pg3.fill(255, 0, 0);
            // pg3.rect(50, 50, 15, 15);
    
            p.image(pg3, margin/2, 0);
        }

        class ScaleLine {
            constructor(intervals, buffer) {
                this.positions = intervals;
                this.buffer = buffer;
            }
        
            display(topPos) {

                if (props.selectedChromosome === "") selectedChromosome = "at1";
                else selectedChromosome = props.selectedChromosome;
        
                // styling
                pg3.stroke(backgroundTextColour);
                pg3.strokeWeight(1);
                pg3.textSize(10);
                pg3.fill(backgroundTextColour);

                var yPos = topPos;
        
                var shiftAmt;
                var actualPos;
                var label;
        
                for (let i=0; i<this.positions.length; i++) {
                    //if (customPos) {
                    actualPos = ((this.positions[i] - props.sliderPosition) / sliderWidth ) * fullScreenWidth;
    
                    // TODO: temp fix-- find a better way
                    if (props.sliderPosition === 0) {
                        label = p.max(parseInt((this.positions[i]/fullScreenWidth) * props.chromosomeMaxPosition[selectedChromosome]), props.chromosomeMinPosition[selectedChromosome]);
                    }
                    else {
                        label = parseInt((this.positions[i]/fullScreenWidth) * props.chromosomeMaxPosition[selectedChromosome]);
                    }
        
                    // determine amount have to shift text labels so they're visible
                    if (i === this.positions.length-1) {
                        shiftAmt = -47;
                    }
                    else {
                        shiftAmt = 0;
                    }
                    pg3.line(actualPos, yPos - 20, actualPos, yPos - 10);
                    pg3.text(label, actualPos + shiftAmt, yPos);
                }
                pg3.line(0, yPos-15, fullScreenWidth + 10, yPos-15);
            }
        }

        class Pointer {
            constructor() {
                this.thirdViewClicked = false;
                this.xPos = null;
            }
        
            setClicked(x) {
                this.thirdViewClicked = true;
                this.xPos = x;
            }
        
            unsetClicked() {
                this.thirdViewClicked = false;
                this.xPos = null;
            }
        
            display() {
                if (this.thirdViewClicked) {
                    pg3.strokeWeight(0);
                    pg3.fill(backgroundTextColour);
                    p.print(this.xPos, geneHeight + baseline)
                    p.print(this.xPos-5, geneHeight + baseline + 15);
                    p.print(this.xPos-5, geneHeight + baseline + 15);
    
                    pg3.triangle(
                        this.xPos, geneHeight + baseline, 
                        this.xPos-5, geneHeight + baseline + 15, 
                        this.xPos+5, geneHeight + baseline + 15
                    );
                }
            }
        }    
    }

    useEffect(() => {
        let inst = new p5(Sketch, containerRef.current);
        return () => inst.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.sliderPosition, props.selectedGenes, props.selectedChromosome]);

    return (
        <div ref={containerRef}></div>
    );
}

export default SliderView;