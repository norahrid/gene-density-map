import data from "./gffOutput.json";

// Calculating constants that most of the components use
const findMinMaxPosition = (geneData, chromoId, isMax) => {
    var pos = [];
  
    // Find the largest position for the spec. chromosome
    for (var key in geneData) {
        if (geneData[key]["chromosomeId"] === chromoId) {
            // get the max pos
            if (isMax) {
                pos.push(geneData[key]["end"]);
            }
            // get the min pos
            else {
                pos.push(geneData[key]["start"]);   
            } 
        }
    }
    if (isMax) return Math.max(...pos);
    else return Math.min(...pos);
  
  }
  
const mapPosition = (geneData, isMax) => {
    var chromoPos = {};
  
    var chromosomes = ["at1", "at2", "at3", "at4", "at5"];
  
    // For each chromosome, find its smallest/largest position + save to a dict
    for (let i=0; i<chromosomes.length; i++) {
            chromoPos[chromosomes[i]] = findMinMaxPosition(geneData, chromosomes[i], isMax);
    }
    return chromoPos;
  }

export const maxChromosomePosition = mapPosition(data, true);
export const minChromosomePosition = mapPosition(data, false);