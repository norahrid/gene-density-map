import data from "./gffOutput.json";

const genes = [];

for (var key in data) {
  // make an array of all of the genes
  var gene = {
    "chromosomeId": data[key]["chromosomeId"],
    "geneId": key,
    "geneStart": data[key]["start"],
    "geneEnd": data[key]["end"]
  }
  genes.push(gene);
}

export { genes };