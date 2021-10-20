import React, { useState } from 'react';
import AllChromosomes from "./components/AllChromosomes";
import ClickView from './components/ClickView';
import SingleChromosome from "./components/SingleChromosome";
import SliderView from "./components/SliderView";
import data from "./gffOutput.json";

function App() {

  const [selectedChromosome, setSelectedChromosome] = useState("at1");
  const [sliderPosition, setSliderPosition] = useState(25);
  const [selectedGenes, setSelectedGenes] = useState([]);
  const [clickedGenes, setClickedGenes] = useState([]);
  const [pointer, setPointer] = useState({'thirdViewClicked': false, 'xPos': null})

  // For passing info from child to parent
  const firstViewToParent = (selection) => {
    setSelectedChromosome(selection);
  }

  const secondViewToParentSlider = (position) => {
    setSliderPosition(position);
  }

  const secondViewToParentGenes = (geneList) => {
    setSelectedGenes(geneList);
  }
  
  const thirdViewToParent = (geneList) => {
    setClickedGenes(geneList);
  }

  const thirdViewToParentPtr = (ptrObj) => {
    setPointer(ptrObj);
  }

  // Calculating constants that most of the components use
  function findMinMaxPosition(geneData, chromoId, isMax) {
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
  
  function mapPosition(geneData, isMax) {
    var chromoPos = {};
  
    var chromosomes = ["at1", "at2", "at3", "at4", "at5"];
  
    // For each chromosome, find its smallest/largest position + save to a dict
    for (let i=0; i<chromosomes.length; i++) {
            chromoPos[chromosomes[i]] = findMinMaxPosition(geneData, chromosomes[i], isMax);
    }
    return chromoPos;
  }

  var maxChromosomePosition = mapPosition(data, true);
  var minChromosomePosition = mapPosition(data, false);

  const GENES = [];

  for (var key in data) {
    // make an array of all of the genes
    var gene = {
      "chromosomeId": data[key]["chromosomeId"],
      "geneId": key,
      "geneStart": data[key]["start"],
      "geneEnd": data[key]["end"]
    }
    GENES.push(gene);
}

  return (
    <div className="App">
      <AllChromosomes
        genes={GENES}
        chromosomeMaxPosition={maxChromosomePosition}
        firstViewToParent={firstViewToParent}
        thirdViewToParentPtr={thirdViewToParentPtr}
      />
      <SingleChromosome
        genes={GENES}
        chromosomeMaxPosition={maxChromosomePosition}
        chromosomeMinPosition={minChromosomePosition}
        selectedChromosome={selectedChromosome}
        sliderPosition={sliderPosition}
        secondViewToParentSlider={secondViewToParentSlider}
        secondViewToParentGenes={secondViewToParentGenes}
        thirdViewToParentPtr={thirdViewToParentPtr}
      />
      <SliderView
        genes={GENES}
        chromosomeMaxPosition={maxChromosomePosition}
        selectedChromosome={selectedChromosome}
        sliderPosition={sliderPosition}
        selectedGenes={selectedGenes}
        thirdViewToParent={thirdViewToParent}
        thirdViewToParentPtr={thirdViewToParentPtr}
        pointer={pointer}
      />
      <ClickView
        genes={GENES}
        gffInfo={data}
        chromosomeMaxPosition={maxChromosomePosition}
        selectedChromosome={selectedChromosome}
        clickedGenes={clickedGenes}
      />

    </div>
  );
}

export default App;
