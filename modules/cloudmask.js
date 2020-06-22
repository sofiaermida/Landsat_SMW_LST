/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

this function mask clouds and cloud shadow using the Quality band

to call this function use:

var cloudmask = require('users/sofiaermida/landsat_smw_lst:modules/cloudmask.js')
var TOAImageMasked = cloudmask.toa(image)
var SRImageMasked = cloudmask.sr(image)
or
var TOAcollectionMasked = ImageCollection.map(cloudmask.toa)
var SRcollectionMasked = ImageCollection.map(cloudmask.sr)


INPUTS:
        - image: <ee.Image>
                image for which clouds are masked 
OUTPUTS:
        - <ee.Image>
          the input image with updated mask
*/


// cloudmask for TOA data
exports.toa = function(image) {
  var qa = image.select('BQA');
  var mask = qa.bitwiseAnd(1 << 4).eq(0);
  return image.updateMask(mask);
};

// cloudmask for SR data
exports.sr = function(image) {
  var qa = image.select('pixel_qa');
  var mask = qa.bitwiseAnd(1 << 3)
    .or(qa.bitwiseAnd(1 << 5))
  return image.updateMask(mask.not());
};