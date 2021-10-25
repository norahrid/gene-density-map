import React, { useEffect, useRef } from "react";
import p5 from 'p5';
import { chromosomeColours, geneHeight, alphaNum, margin, componentHeight, 
    backgroundColour,baseline, backgroundTextColour, sliderWidth } from "../Constants";
import { drawScaleLine } from "./ScaleLine";
import { maxChromosomePosition, minChromosomePosition } from "../CalculateMinMaxPosition";

const SliderView = props => {

    const containerRef = useRef();

    const Sketch = p => {

        var fullScreenWidth;
        var pg3;
        var clickedGenes;
        
        p.setup = () => {
            p.createCanvas(p.windowWidth, componentHeight);
            fullScreenWidth = p.windowWidth - margin;

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

        p.mousePressed = () => {
            //p.print(p.mouseY);
            if (p.mouseY >= baseline && p.mouseY <= baseline + geneHeight) {
                clickedGenes = [];
                props.thirdViewToParentPtr({'thirdViewClicked': true, 'xPos': p.mouseX})
                
                var convertedX = ((p.mouseX/fullScreenWidth) * 75) + props.sliderPosition;
                for (let j=0; j<props.selectedGenes.length; j++) {
                    if (convertedX >= props.selectedGenes[j].start - 0.5 && convertedX <= props.selectedGenes[j].end + 0.5) {
                        clickedGenes.push(props.selectedGenes[j]);
                    }  
                }
                props.thirdViewToParent(clickedGenes);
                p.redraw();
            }
        }

        p.mouseMoved = () => {
            if (p.mouseX >= margin/2 && p.mouseX <= fullScreenWidth + (margin/2)) {

                p.background(backgroundColour);

                drawThirdView(
                    backgroundColour, 
                    chromosomeColours, 
                    geneHeight, 
                    margin, 
                    alphaNum
                ); 

                //var x = parseInt((((p.mouseX-(margin/2))+props.sliderPosition)/fullScreenWidth) * maxChromosomePosition[props.selectedChromosome]);
                
                var x = (((p.mouseX-(margin/2))/fullScreenWidth) * 75) + props.sliderPosition;
                var y = parseInt((x/fullScreenWidth)*maxChromosomePosition[props.selectedChromosome]);

                //p.print('converted x ', x);
                // p.print('width ', fullScreenWidth);
                // p.print('slider ', props.sliderPosition);
                // var x = parseInt((((p.mouseX-(margin/2)) - props.sliderPosition)/sliderWidth) * fullScreenWidth) + minChromosomePosition[props.selectedChromosome];
                
                
                p.strokeWeight(1);
                p.stroke(backgroundTextColour);
                p.fill(255);

                var pos;

                if (p.mouseX >= fullScreenWidth-75) {
                    pos = p.mouseX - 75;
                }
                else {
                    pos = p.mouseX;
                }
       
                // draw tooltip to show mouse position
                p.rect(pos, p.mouseY, 75, 25);
                p.fill(backgroundTextColour);
                p.text(y, pos + 15, p.mouseY + 15);
            }
        }

        function drawThirdView(bgCol, colours, gHeight, margin, alphaWeight) {
            pg3.background(bgCol);
            
            pg3.strokeWeight(0);
            var colKey = colours[props.selectedChromosome];
            pg3.fill(colKey["r"], colKey["g"], colKey["b"], alphaWeight);
    
            for (let i=0; i<props.selectedGenes.length; i++) {
                var s = (props.selectedGenes[i].start - props.sliderPosition)/75;
                var width = (props.selectedGenes[i].end - props.selectedGenes[i].start)/75;
                pg3.rect(s*fullScreenWidth, baseline, width*fullScreenWidth, gHeight);
            }
    
            pg3.fill(backgroundTextColour);
            pg3.textSize(12);
            pg3.text("Subregion: " + props.selectedChromosome, margin, baseline-10);

            var intervals = [props.sliderPosition, props.sliderPosition+sliderWidth];
            drawScaleLine("v3", pg3, intervals, props.sliderPosition, geneHeight+(2*baseline), props.selectedChromosome, fullScreenWidth);

            p.image(pg3, margin/2, 0);

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
    }, [props.sliderPosition, props.selectedGenes, props.selectedChromosome]);

    return (
        <div ref={containerRef}></div>
    );
}

export default SliderView;