/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471
Malakar, N.K., Hulley, G.C., Hook, S.J., Laraby, K., Cook, M., Schott, J.R., 2018. 
    An Operational Land Surface Temperature Product for Landsat Thermal Data: Methodology 
    and Validation. IEEE Trans. Geosci. Remote Sens. 56, 5717–5735. 
    https://doi.org/10.1109/TGRS.2018.2824828

This function computes broad-band emissivity from ASTER GED

to call this function use:

var BBEfun = require('users/sofiaermida/landsat_smw_lst:modules/broadband_emiss.js')
var ImagewithBBE = BBEfun.addBand(dynamic)(image)
or
var collectionwithBBE = ImageCollection.map(BBEfun.addBand(dynamic))

USES:
    - ASTER_bare_emiss.js

INPUTS:
        - dynamic: <boolean>
                  'true': use vegetation cover correction
                  'false': use original ASTER GED emissivity
        - image: <ee.Image>
                  an image is required to clip the ASTER data
                  to the image geometry; using the full ASTER image
                  compromises the performance
OUTPUTS:
        - <ee.Image>
          the input image with 1 new band: 
          'BBE': broad-band emissivity
*/



var ASTERGED = require('users/sofiaermida/landsat_smw_lst:modules/ASTER_bare_emiss.js')

exports.addBand = function(dynamic){
  var wrap = function(image){
    
    // get ASTER emissivity
    var aster = ee.Image("NASA/ASTER_GED/AG100_003")
      .clip(image.geometry());
  
    var orig = aster.select('emissivity_band10').multiply(0.001);
    var dynam = image.expression('fvc*0.99+(1-fvc)*em_bare',{
      'fvc':image.select('FVC'),
      'em_bare':ASTERGED.emiss_bare_band10(image)});
    var em10 = ee.Image(ee.Algorithms.If(dynamic,dynam,orig));
  
    orig = aster.select('emissivity_band11').multiply(0.001);
    dynam = image.expression('fvc*0.99+(1-fvc)*em_bare',{
      'fvc':image.select('FVC'),
      'em_bare':ASTERGED.emiss_bare_band11(image)});
    var em11 = ee.Image(ee.Algorithms.If(dynamic,dynam,orig));
  
    orig = aster.select('emissivity_band12').multiply(0.001);
    dynam = image.expression('fvc*0.99+(1-fvc)*em_bare',{
      'fvc':image.select('FVC'),
      'em_bare':ASTERGED.emiss_bare_band12(image)});
    var em12 = ee.Image(ee.Algorithms.If(dynamic,dynam,orig));
  
    orig = aster.select('emissivity_band13').multiply(0.001);
    dynam = image.expression('fvc*0.99+(1-fvc)*em_bare',{
      'fvc':image.select('FVC'),
      'em_bare':ASTERGED.emiss_bare_band13(image)});
    var em13 = ee.Image(ee.Algorithms.If(dynamic,dynam,orig));
  
    orig = aster.select('emissivity_band14').multiply(0.001);
    dynam = image.expression('fvc*0.99+(1-fvc)*em_bare',{
      'fvc':image.select('FVC'),
      'em_bare':ASTERGED.emiss_bare_band14(image)});
    var em14 = ee.Image(ee.Algorithms.If(dynamic,dynam,orig));
      
    
    var bbe = image.expression('0.128 + 0.014*em10 + 0.145*em11 + 0.241*em12 + 0.467*em13 + 0.004*em14',
      {'em10':em10,'em11':em11,'em12':em12,'em13':em13,'em14':em14});
    
    return image.addBands(bbe.rename('BBE'))
  }
  return wrap
}