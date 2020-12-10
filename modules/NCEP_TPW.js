/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471

this function matches the atmospheric water vapour data
from NCEP reanalysis to each Landsat image
tpw values are interpolated from the 6-hourly model times to the image time

to call this function use:

var NCEP_TPW = require('users/sofiaermida/landsat_smw_lst:modules/NCEP_TPW.js')
var ImagewithTPW = NCEP_TPW.addBand(image)
or
var collectionwithPTW = ImageCollection.map(NCEP_TPW.addBand)

INPUTS:
        - image: <ee.Image>
                image for which to interpolate the TPW data
                needs the 'system:time_start' image property
OUTPUTS:
        - <ee.Image>
          the input image with 3 new bands: 
          'TPW': total precipitable water values
          'TPWpos': index for the LUT of SMW algorithm coefficients
          
  10.12.2020: bug correction in the tpw interpolation expression
*/

exports.addBand = function(image){

  // first select the day of interest 
  var date = ee.Date(image.get('system:time_start'))
  var year = ee.Number.parse(date.format('yyyy'))
  var month = ee.Number.parse(date.format('MM'))
  var day = ee.Number.parse(date.format('dd'))
  var date1 = ee.Date.fromYMD(year,month,day)
  var date2 = date1.advance(1,'days')

  // function compute the time difference from landsat image
  var datedist = function(image){
    return image.set('DateDist',
      ee.Number(image.get('system:time_start'))
      .subtract(date.millis()).abs())
  };
  
  // load atmospheric data collection
  var TPWcollection = ee.ImageCollection('NCEP_RE/surface_wv')
                  .filter(ee.Filter.date(date1.format('yyyy-MM-dd'), date2.format('yyyy-MM-dd')))
                  .map(datedist)
                  
  // select the two closest model times
    var closest = (TPWcollection.sort('DateDist')).toList(2);
    
  // check if there is atmospheric data in the wanted day
  // if not creates a TPW image with non-realistic values
  // these are then masked in the SMWalgorithm function (prevents errors)
  var tpw1 = ee.Image(ee.Algorithms.If(closest.size().eq(0), ee.Image.constant(-999.0),
                      ee.Image(closest.get(0)).select('pr_wtr') ));
  var tpw2 = ee.Image(ee.Algorithms.If(closest.size().eq(0), ee.Image.constant(-999.0),
                        ee.Algorithms.If(closest.size().eq(1), tpw1,
                        ee.Image(closest.get(1)).select('pr_wtr') )));
  
  var time1 = ee.Number(ee.Algorithms.If(closest.size().eq(0), 1.0,
                        ee.Number(tpw1.get('DateDist')).divide(ee.Number(21600000)) ));
  var time2 = ee.Number(ee.Algorithms.If(closest.size().lt(2), 0.0,
                        ee.Number(tpw2.get('DateDist')).divide(ee.Number(21600000)) ));
  
  var tpw = tpw1.expression('tpw1*time2+tpw2*time1',
                            {'tpw1':tpw1,
                            'time1':time1,
                            'tpw2':tpw2,
                            'time2':time2
                            }).clip(image.geometry());

  // SMW coefficients are binned by TPW values
  // find the bin of each TPW value
  var pos = tpw.expression(
    "value = (TPW>0 && TPW<=6) ? 0" +
    ": (TPW>6 && TPW<=12) ? 1" +
    ": (TPW>12 && TPW<=18) ? 2" +
    ": (TPW>18 && TPW<=24) ? 3" +
    ": (TPW>24 && TPW<=30) ? 4" +
    ": (TPW>30 && TPW<=36) ? 5" +
    ": (TPW>36 && TPW<=42) ? 6" +
    ": (TPW>42 && TPW<=48) ? 7" +
    ": (TPW>48 && TPW<=54) ? 8" +
    ": (TPW>54) ? 9" +
    ": 0",{'TPW': tpw})
    .clip(image.geometry());
  
  // add tpw to image as a band
  var withTPW = (image.addBands(tpw.rename('TPW'),['TPW'])).addBands(pos.rename('TPWpos'),['TPWpos']);
  
  return withTPW
};
