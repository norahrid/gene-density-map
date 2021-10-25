// Reads the gff file and converts it to a json file for easier p5.js work
// Borrows HEAVILY from Venkat's data fetching script of the same name.

const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');

var delim = "/";

var fname = "https://raw.githubusercontent.com/kiranbandi/synvisio/master/build/assets/files/at_coordinate.gff";
var assetDestination = path.join(__dirname.split(delim).slice(0, -1).join(delim), "assets");

// Read the gff file

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
    fs.writeFile(path.join(assetDestination,"gffOutput.json"), genomeStr, err => {
        if (err) {
            console.log('Error writing to file: ', err);
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

