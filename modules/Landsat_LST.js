/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471

This function selects the Landsat data based on user inputs
and performes the LST computation

to call this function use:

var LandsatLST = require('users/sofiaermida/landsat_smw_lst:modules/Landsat_LST.js')
var LandsatCollection = LandsatLST.collection(landsat, date_start, date_end, geometry)

USES:
    - NCEP_TPW.js
    - cloudmask.js
    - compute_NDVI.js
    - compute_FVC.js
    - compute_emissivity.js
    - SMWalgorithm.js

INPUTS:
        - landsat: <string>
                  the Landsat satellite id
                  valid inputs: 'L4', 'L5', 'L7' and 'L8'
        - date_start: <string>
                      start date of the Landsat collection
                      format: YYYY-MM-DD
        - date_end: <string>
                    end date of the Landsat collection
                    format: YYYY-MM-DD
        - geometry: <ee.Geometry>
                    region of interest
        - use_ndvi: <boolean>
                if true, NDVI values are used to obtain a
                dynamic emissivity; if false, emissivity is 
                obtained directly from ASTER
OUTPUTS:
        - <ee.ImageCollection>
          image collection with bands:
          - landsat original bands: all from SR excpet the TIR bands (from TOA) 
          - cloud masked
          - 'NDVI': normalized vegetation index
          - 'FVC': fraction of vegetation cover [0-1]
          - 'TPW': total precipitable water [mm]
          - 'EM': surface emissvity for TIR band
          - 'LST': land surface temperature
*/

// MODULES DECLARATION -----------------------------------------------------------
// Total Precipitable Water 
var NCEP_TPW = require('users/sofiaermida/landsat_smw_lst:modules/NCEP_TPW.js')
//cloud mask
var cloudmask = require('users/sofiaermida/landsat_smw_lst:modules/cloudmask.js')
//Normalized Difference Vegetation Index
var NDVI = require('users/sofiaermida/landsat_smw_lst:modules/compute_NDVI.js')
//Fraction of Vegetation cover
var FVC = require('users/sofiaermida/landsat_smw_lst:modules/compute_FVC.js')
//surface emissivity
var EM = require('users/sofiaermida/landsat_smw_lst:modules/compute_emissivity.js')
// land surface temperature
var LST = require('users/sofiaermida/landsat_smw_lst:modules/SMWalgorithm.js')
// --------------------------------------------------------------------------------


exports.collection = function(landsat, date_start, date_end, geometry, use_ndvi){

  // select collections
  var toa_collection = ee.String(
    ee.Algorithms.If(landsat==='L4','LANDSAT/LT04/C01/T1_TOA',
    ee.Algorithms.If(landsat==='L5','LANDSAT/LT05/C01/T1_TOA',
    ee.Algorithms.If(landsat==='L7','LANDSAT/LE07/C01/T1_TOA',
                                    'LANDSAT/LC08/C01/T1_TOA')))
  );
  
  var sr_collection = ee.String(
    ee.Algorithms.If(landsat==='L4','LANDSAT/LT04/C01/T1_SR',
    ee.Algorithms.If(landsat==='L5','LANDSAT/LT05/C01/T1_SR',
    ee.Algorithms.If(landsat==='L7','LANDSAT/LE07/C01/T1_SR',
                                    'LANDSAT/LC08/C01/T1_SR')))
  );

  // load TOA Radiance/Reflectance
  var landsatTOA = ee.ImageCollection(toa_collection.getInfo())
                .filter(ee.Filter.date(date_start, date_end))
                .filterBounds(geometry)
                .map(cloudmask.toa)
  
              
  // load Surface Reflectance collection for NDVI
  var landsatSR = ee.ImageCollection(sr_collection.getInfo())
                .filter(ee.Filter.date(date_start, date_end))
                .filterBounds(geometry)
                .map(cloudmask.sr)
                .map(NDVI.addBand(landsat))
                .map(FVC.addBand(landsat))
                .map(NCEP_TPW.addBand)
                .map(EM.addBand(landsat,use_ndvi))

  // combine collections
  // all channels from surface reflectance collection
  // except tir channels: from TOA collection
  // select TIR bands
  var tir = ee.List(
    ee.Algorithms.If(landsat==='L8',['B10','B11'],
    ee.Algorithms.If(landsat==='L7',['B6_VCID_1','B6_VCID_2'],
                                    ['B6',])));
  var landsatALL = (landsatSR.combine(landsatTOA.select(tir),true))
  
  // compute the LST
  var landsatLST = landsatALL.map(LST.addBand(landsat));

  return landsatLST

};


