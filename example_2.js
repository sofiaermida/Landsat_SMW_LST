/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471

Example 2:
  This example shows how to get LST time series at the SURFRAD DRA site
  it corresponds to the method used to extract time series 
  for comparison with station LST used in Ermida et al. (2020)
    
*/
// link to the code that computes the Landsat LST
var LandsatLST = require('users/sofiaermida/landsat_smw_lst:modules/Landsat_LST.js')
// link to the code that computes broad-band emissivity
var BBE = require('users/sofiaermida/landsat_smw_lst:modules/broadband_emiss.js')

// select region of interest, date range, and landsat satellite
var site = ee.Geometry.Point([-116.01947,36.62373]);
var geometry = site.buffer(30);
var date_start = '1982-08-01';
var date_end = '2020-01-31';
var use_ndvi = true;

// compute the LST for each Landsat
var L8coll = LandsatLST.collection('L8', date_start, date_end, geometry, use_ndvi);
var L7coll = LandsatLST.collection('L7', date_start, date_end, geometry, use_ndvi);
var L5coll = LandsatLST.collection('L5', date_start, date_end, geometry, use_ndvi);
var L4coll = LandsatLST.collection('L4', date_start, date_end, geometry, use_ndvi);

// compute broadband emissivity
L8coll = L8coll.map(BBE.addBand(true))
L7coll = L7coll.map(BBE.addBand(true))
L5coll = L5coll.map(BBE.addBand(true))
L4coll = L4coll.map(BBE.addBand(true))


// get bands for each landsat in one collection
var getband = function(landsat, bandname){
  var wrap = function(image){
    return image.select(bandname).rename(bandname.concat('_').concat(landsat))
  }
  return wrap
}
// merge all Landsat LST collections for the chart
var bandname = 'LST'
var LandsatColl = L8coll.map(getband('L8',bandname));
LandsatColl = LandsatColl.merge(L7coll.map(getband('L7',bandname)));
LandsatColl = LandsatColl.merge(L5coll.map(getband('L5',bandname)));
LandsatColl = LandsatColl.merge(L4coll.map(getband('L4',bandname)));

var TimeSeries = ui.Chart.image.series(
    LandsatColl, geometry, ee.Reducer.mean(), 30, 'system:time_start')
        .setChartType('ScatterChart')
        .setOptions({
          vAxis: {title: bandname},
          lineWidth: 1,
          pointSize: 4
});
print(TimeSeries)


// uncomment and edit the code below to export timeseries to your drive
/*
var myFeatures = ee.FeatureCollection(L8coll.map(function(image){
  var date = ee.Date(image.get('system:time_start'));
  var lst = image.select('LST')
  var em = image.select('EM')
  var fvc = image.select('FVC')
  var tpw = image.select('TPW')
  var bbe = image.select('BBE')
  return ee.Feature(site, {
    'year':ee.Number(date.get('year')), 
    'month':ee.Number(date.get('month')),
    'day':ee.Number(date.get('day')),
    'hour':ee.Number(date.get('hour')),
    'minute':ee.Number(date.get('minute')),
    'lst':ee.Number(lst.reduceRegion(
      ee.Reducer.mean(),geometry,30).get('LST')),
    'tpw':ee.Number(tpw.reduceRegion(
      ee.Reducer.mean(),geometry,30).get('TPW')),
    'em':ee.Number(em.reduceRegion(
      ee.Reducer.mean(),geometry,30).get('EM')),
    'fvc':ee.Number(fvc.reduceRegion(
      ee.Reducer.mean(),geometry,30).get('FVC')),
    'bbe':ee.Number(bbe.reduceRegion(
      ee.Reducer.mean(),geometry,30).get('BBE'))
  });
}));

Export.table.toDrive({
  collection: myFeatures,
  description: 'MyTask',
  folder: 'MyFolder',
  fileNamePrefix: 'Landsat8_LST_timeseries', 
  fileFormat: 'CSV'
});
*/