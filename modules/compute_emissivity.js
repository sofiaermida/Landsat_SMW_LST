/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471

this function computes surface emissivity for Landsat
requires values of FVC: compute_FVC.js

ref: Malakar, N.K., Hulley, G.C., Hook, S.J., Laraby, K., Cook, M., Schott, J.R., 2018. 
    An Operational Land Surface Temperature Product for Landsat Thermal Data: Methodology 
    and Validation. IEEE Trans. Geosci. Remote Sens. 56, 5717–5735. 
    https://doi.org/10.1109/TGRS.2018.2824828

to call this function use:

var EMfun = require('users/sofiaermida/landsat_smw_lst:modules/compute_emissivity.js')
var ImagewithEM = EMfun.addBand(landsat)(image)
or
var collectionwithEM = ImageCollection.map(EMfun.addBand(landsat))

USES:
    - ASTER_bare_emiss.js
    
INPUTS:
        - landsat: <string>
                  the Landsat satellite id
                  valid inputs: 'L4', 'L5', 'L7' and 'L8'
        - use_ndvi: <boolean>
                if true, NDVI values are used to obtain a
                dynamic emissivity; if false, emissivity is 
                obtained directly from ASTER
        - image: <ee.Image>
                image for which to calculate the emissivity
OUTPUTS:
        - <ee.Image>
          the input image with 1 new band: 
          'EM': surface emissivity of TIR band
*/

var ASTERGED = require('users/sofiaermida/landsat_smw_lst:modules/ASTER_bare_emiss.js')

// this function computes the emissivity of the 
// Landsat TIR band using ASTER and FVC
exports.addBand = function(landsat, use_ndvi){
  var wrap = function(image){
    
    var c13 = ee.Number(ee.Algorithms.If(landsat==='L4',0.3222,
                            ee.Algorithms.If(landsat==='L5',-0.0723,
                            ee.Algorithms.If(landsat==='L7',0.2147,
                            0.6820))));
    var c14 = ee.Number(ee.Algorithms.If(landsat==='L4',0.6498,
                            ee.Algorithms.If(landsat==='L5',1.0521,
                            ee.Algorithms.If(landsat==='L7',0.7789,
                            0.2578))));
    var c = ee.Number(ee.Algorithms.If(landsat==='L4',0.0272,
                            ee.Algorithms.If(landsat==='L5',0.0195,
                            ee.Algorithms.If(landsat==='L7',0.0059,
                            0.0584))));
  
    // get ASTER emissivity
    // convolve to Landsat band
    var emiss_bare = image.expression('c13*EM13 + c14*EM14 + c',{
      'EM13':ASTERGED.emiss_bare_band13(image),
      'EM14':ASTERGED.emiss_bare_band14(image),
      'c13':ee.Image(c13),
      'c14':ee.Image(c14),
      'c':ee.Image(c)
      });

    // compute the dynamic emissivity for Landsat
    var EMd = image.expression('fvc*0.99+(1-fvc)*em_bare',
      {'fvc':image.select('FVC'),'em_bare':emiss_bare});
      
    // compute emissivity directly from ASTER
    // without vegetation correction
    // get ASTER emissivity
    var aster = ee.Image("NASA/ASTER_GED/AG100_003")
      .clip(image.geometry());
    var EM0 = image.expression('c13*EM13 + c14*EM14 + c',{
      'EM13':aster.select('emissivity_band13').multiply(0.001),
      'EM14':aster.select('emissivity_band14').multiply(0.001),
      'c13':ee.Image(c13),
      'c14':ee.Image(c14),
      'c':ee.Image(c)
      });
      
    // select which emissivity to output based on user selection
    var EM = ee.Image(ee.Algorithms.If(use_ndvi,EMd,EM0));
   
    return image.addBands(EM.rename('EM'));
  }
  return wrap
}