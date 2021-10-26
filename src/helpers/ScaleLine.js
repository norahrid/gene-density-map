import { sliderWidth, backgroundTextColour} from "../constants";
import { maxChromosomePosition, minChromosomePosition } from "./CalculateMinMaxPosition";

export const drawScaleLine = (viewName, buffer, intervals, sliderPosition, yPos, selectedChromosome, fullScreenWidth) => {

    buffer.stroke(backgroundTextColour);
    buffer.strokeWeight(1);
    buffer.textSize(10);
    buffer.fill(backgroundTextColour);

    var shiftAmt;
    var actualPos;
    var label;
    var maxEnd = Math.max(...intervals);

    for (let i=0; i<intervals.length; i++) {
        if (viewName === "v2") {
            actualPos = (intervals[i]/maxEnd) * fullScreenWidth;
            // the og position of the gene listed in the gff file
            label = parseInt(intervals[i]);
        }
        else if (viewName === "v3") {
            actualPos = ((intervals[i] - sliderPosition) / sliderWidth ) * fullScreenWidth;
            label = calculateLabelForView3(intervals[i], sliderPosition, selectedChromosome, fullScreenWidth);
        }

        // determine amount have to shift text labels so they're visible
        if (i === intervals.length-1) {
            shiftAmt = -47;
        }
        else {
            shiftAmt = 0;
        }

        buffer.line(actualPos, yPos - 20, actualPos, yPos - 10);
        buffer.text(label, actualPos + shiftAmt, yPos);
    }
    buffer.line(0, yPos-15, fullScreenWidth + 10, yPos-15);

}

const calculateLabelForView3 = (interval, sliderPosition, selectedChromosome, fullScreenWidth) => {
    var label;
    // TODO: temp fix-- find a better way
    if (sliderPosition === 0) {
        label = Math.max(parseInt((interval/fullScreenWidth) * maxChromosomePosition[selectedChromosome]), minChromosomePosition[selectedChromosome]);
    }
    else {
        label = parseInt((interval/fullScreenWidth) * maxChromosomePosition[selectedChromosome]);
    }
    return label;
}


