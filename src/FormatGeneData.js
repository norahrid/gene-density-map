export const formatGeneData = (data) => {
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

  return genes;

}
