/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471

this function computes the Fraction of Vegetation Cover from NDVI
the compute_NDVI.js function must be called before this one

to call this function use:

var FVCfun = require('users/sofiaermida/landsat_smw_lst:modules/compute_FVC.js')
var ImagewithFVC = FVCfun.addBand(landsat)(image)
or
var collectionwithFVC = ImageCollection.map(FVCfun.addBand(landsat))

USES:
    - SMW_coefficients.js

INPUTS:
        - landsat: <string>
                  the Landsat satellite id
                  valid inputs: 'L4', 'L5', 'L7' and 'L8'
        - image: <ee.Image>
                image for which to calculate the FVC
OUTPUTS:
        - <ee.Image>
          the input image with 1 new band: 
          'FVC': fraction of vegetation cover
*/
exports.addBand = function(landsat){
  var wrap = function(image){
    
    var ndvi = image.select('NDVI')
    
    // Compute FVC
    var fvc = image.expression('((ndvi-ndvi_bg)/(ndvi_vg - ndvi_bg))**2',
      {'ndvi':ndvi,'ndvi_bg':0.2,'ndvi_vg':0.86});
    fvc = fvc.where(fvc.lt(0.0),0.0);
    fvc = fvc.where(fvc.gt(1.0),1.0);
    
    return image.addBands(fvc.rename('FVC'));
  }
  return wrap
};