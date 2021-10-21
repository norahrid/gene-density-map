import React, { useState } from 'react';
import AllChromosomes from "./components/AllChromosomes";
import ClickView from './components/ClickView';
import SingleChromosome from "./components/SingleChromosome";
import SliderView from "./components/SliderView";

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

  return (
    <div className="App">
      <AllChromosomes
        firstViewToParent={firstViewToParent}
        thirdViewToParentPtr={thirdViewToParentPtr}
        thirdViewToParent={thirdViewToParent}
      />
      <SingleChromosome
        selectedChromosome={selectedChromosome}
        sliderPosition={sliderPosition}
        secondViewToParentSlider={secondViewToParentSlider}
        secondViewToParentGenes={secondViewToParentGenes}
        thirdViewToParentPtr={thirdViewToParentPtr}
        thirdViewToParent={thirdViewToParent}
      />
      <SliderView
        selectedChromosome={selectedChromosome}
        sliderPosition={sliderPosition}
        selectedGenes={selectedGenes}
        thirdViewToParent={thirdViewToParent}
        thirdViewToParentPtr={thirdViewToParentPtr}
        pointer={pointer}
      />
      <ClickView
        selectedChromosome={selectedChromosome}
        clickedGenes={clickedGenes}
      />

    </div>
  );
}

export default App;
