// Reads the gff file and converts it to a json file for easier p5.js work (at least for me)

const axios = require('axios');
const fs = require('fs');
const os = require('os');

var fetchData = {};

var fname = "https://raw.githubusercontent.com/kiranbandi/synvisio/master/build/assets/files/at_coordinate.gff";

// Read the gff file
// TODO: make more robust and make a function reading gff into map instead of dumping everything into the callback like a heathen

axios.get(fname)
    .then(res => {
        let gffData = res.data;
        //console.log(gffData);

        // Get the info from gff file
        let genomeEntry,
        genomeLibrary = new Map()

        gffData.split('\n').forEach(function (line) {
        genomeEntry = line.split("\t");
        // 4 tab seperated entries , 1st is chromosome index , 2nd is unique gene id ,3rd and 4th are the start and end positions
        let chromosomeId = genomeEntry[0],
            geneStart = parseInt(genomeEntry[2]),
            geneEnd = parseInt(genomeEntry[3]),
            geneId = genomeEntry[1];

        // filter the '' and other insufficient lines
        if (chromosomeId.length >= 2 ) {
            genomeLibrary.set(geneId, {
                'start': geneStart,
                'end': geneEnd,
                // the first 2 characters are the genome name and can be removed
                'chromosomeId': chromosomeId
            })
        }
    });

    var genomeDict = Object.fromEntries(genomeLibrary);
    var genomeStr = JSON.stringify(genomeDict)
    fs.writeFile("/Users/norahr/Desktop/gffOutput.json", genomeStr, err => {
        if (err) {
            console.log('Error writing to file.')
        }
    })

    // // Format for csv conversion
    // var allData = [["chromosomeId", "geneId", "geneStart", "geneEnd"]];
    // for (let elem of genomeLibrary.keys()) {
    //     var data = genomeLibrary.get(elem);
    //     var row = [data.chromosomeId, elem, data.start, data.end];
    //     allData.push(row);
    // }

    // //console.log(allData);
    // fs.writeFileSync("/Users/norahr/Desktop/gffOutput.csv", allData.join(os.EOL));
    
    }).catch((err) => {
        console.log(err);
    });

