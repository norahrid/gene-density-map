import { maxChromosomePosition } from "./CalculateMinMaxPosition";

export const getStartCoord = (gene, w) => {
    return (gene.geneStart/maxChromosomePosition[gene.chromosomeId]) * w;
}

export const getWidth = (gene, w) => {
    return ((gene.geneEnd - gene.geneStart)/maxChromosomePosition[gene.chromosomeId]) * w;
}