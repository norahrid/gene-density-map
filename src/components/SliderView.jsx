import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour,baseline, backgroundTextColour, sliderWidth, componentWidth } from "../constants";
import { drawScaleLine } from "../helpers/ScaleLine";
import { maxChromosomePosition } from "../helpers/CalculateMinMaxPosition";

const SliderView = props => {

    const containerRef = useRef();

    const Sketch = p => {

        var fullScreenWidth;
        var pg3;
        var clickedGenes;
        
        p.setup = () => {
            p.createCanvas(componentWidth, componentHeight);
            //fullScreenWidth = p.windowWidth - margin;

            p.noLoop();
        }

        p.draw = () => {
            p.background(backgroundColour);

            // 3rd view to show the genes contained in the slider
            pg3 = p.createGraphics(componentWidth, componentHeight);

            drawThirdView(
                backgroundColour, 
                chromosomeColours, 
                geneHeight, 
                margin, 
                alphaNum
            ); 
        }

        p.mousePressed = () => {
            //p.print(p.mouseY);
            if (p.mouseY >= baseline && p.mouseY <= baseline + geneHeight) {
                clickedGenes = [];
                props.thirdViewToParentPtr({'thirdViewClicked': true, 'xPos': p.mouseX})
                
                var convertedX = ((p.mouseX/componentWidth) * 75) + props.sliderPosition;
                for (let j=0; j<props.selectedGenes.length; j++) {
                    if (convertedX >= props.selectedGenes[j].start - 0.5 && convertedX <= props.selectedGenes[j].end + 0.5) {
                        clickedGenes.push(props.selectedGenes[j]);
                    }  
                }
                props.thirdViewToParent(clickedGenes);
                p.redraw();
            }
        }
        // Currently has an error with correctly calculating position
        // p.mouseMoved = () => {
        //     // only show the coords of genes that are under the slider
        //     if (p.mouseX >= 0 && p.mouseX <= componentWidth) {
        //         p.background(backgroundColour);
        //         p.image(pg3, 0, 0);
        //         drawPointer();

        //         var x = ((p.mouseX/componentWidth) * sliderWidth) + props.sliderPosition;
        //         var y = parseInt((x/componentWidth)*maxChromosomePosition[props.selectedChromosome]);

        //         p.strokeWeight(1);
        //         p.stroke(backgroundTextColour);
        //         p.fill(255);

        //         var pos;

        //         if (p.mouseX >= componentWidth-75) {
        //             pos = p.mouseX - 75;
        //         }
        //         else {
        //             pos = p.mouseX;
        //         }
       
        //         // draw tooltip to show mouse position
        //         p.rect(pos, p.mouseY, 75, 25);
        //         p.fill(backgroundTextColour);
        //         p.text(y, pos + 15, p.mouseY + 15);
        //     }
        // }

        function drawThirdView(bgCol, colours, gHeight, margin, alphaWeight) {
            pg3.background(bgCol);
            
            pg3.strokeWeight(0);
            var colKey = colours[props.selectedChromosome];
            pg3.fill(colKey["r"], colKey["g"], colKey["b"], alphaWeight);
    
            for (let i=0; i<props.selectedGenes.length; i++) {
                //p.print(props.selectedGenes[i]);
                var s = (props.selectedGenes[i].start - props.sliderPosition)/75;
                var width = (props.selectedGenes[i].end - props.selectedGenes[i].start)/75;
                pg3.rect(s*componentWidth, baseline, width*componentWidth, gHeight);
            }
    
            //pg3.fill(backgroundTextColour);
            //pg3.textSize(12);
            //pg3.text("Subregion: " + props.selectedChromosome, margin, baseline-10);

            var intervals = [props.sliderPosition, props.sliderPosition+sliderWidth];
            drawScaleLine("v3", pg3, intervals, props.sliderPosition, geneHeight+(2*baseline), props.selectedChromosome, componentWidth);

            p.image(pg3, 0, 0);
            drawPointer();
        }

        function drawPointer() {
            // draw pointer to indicate the spot that was last clicked
            p.strokeWeight(0);
            p.fill(backgroundTextColour);
            p.triangle(
                props.pointer.xPos, geneHeight + baseline, 
                props.pointer.xPos-5, geneHeight + baseline + 15, 
                props.pointer.xPos+5, geneHeight + baseline + 15
            );
        }
    }

    useEffect(() => {
        let inst = new p5(Sketch, containerRef.current);
        return () => inst.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.sliderPosition, props.selectedGenes, props.selectedChromosome, props.pointer]);

    return (
        <div ref={containerRef}></div>
    );
}

export default SliderView;