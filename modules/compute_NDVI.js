/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

this function computes NDVI values for Landsat


to call this function use:

var NDVIfun = require('users/sofiaermida/landsat_smw_lst:modules/compute_NDVI.js')
var ImagewithNDVI = NDVIfun.addBand(landsat)(image)
or
var collectionwithNDVI = ImageCollection.map(NDVIfun.addBand(landsat))

INPUTS:
        - landsat: <string>
                  the Landsat satellite id
                  valid inputs: 'L4', 'L5', 'L7' and 'L8'
        - image: <ee.Image>
                image for which to calculate the NDVI
OUTPUTS:
        - <ee.Image>
          the input image with 1 new band: 
          'NDVI': normalized difference vegetation index
          
  11-07-2022: update to use Collection 2 Level 2 Surface Reflectance data
  
  02-08-2023: update to process Landsat 9
*/

exports.addBand = function(landsat){
  var wrap = function(image){
    
    // choose bands
    var nir = ee.String(ee.Algorithms.If(landsat==='L8','SR_B5',
                        ee.Algorithms.If(landsat==='L9','SR_B5','SR_B4')))
    var red = ee.String(ee.Algorithms.If(landsat==='L8','SR_B4',
                        ee.Algorithms.If(landsat==='L9','SR_B4','SR_B3')))
  
    // compute NDVI 
    return image.addBands(image.expression('(nir-red)/(nir+red)',{
      'nir':image.select(nir).multiply(0.0000275).add(-0.2),
      'red':image.select(red).multiply(0.0000275).add(-0.2)
    }).rename('NDVI'))
  }
  return wrap
};
