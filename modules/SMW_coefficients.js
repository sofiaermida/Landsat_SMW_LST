/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471
*/
// coefficients for the Statistical Mono-Window Algorithm
exports.coeff_SMW_L4 = ee.FeatureCollection([
  ee.Feature(null, {'TPWpos': 0, 'A': 0.9755, 'B': -205.2767, 'C': 212.0051}),
  ee.Feature(null, {'TPWpos': 1, 'A': 1.0155, 'B': -233.8902, 'C': 230.4049}),
  ee.Feature(null, {'TPWpos': 2, 'A': 1.0672, 'B': -257.1884, 'C': 239.3072}),
  ee.Feature(null, {'TPWpos': 3, 'A': 1.1499, 'B': -286.2166, 'C': 244.8497}),
  ee.Feature(null, {'TPWpos': 4, 'A': 1.2277, 'B': -316.7643, 'C': 253.0033}),
  ee.Feature(null, {'TPWpos': 5, 'A': 1.3649, 'B': -361.8276, 'C': 258.5471}),
  ee.Feature(null, {'TPWpos': 6, 'A': 1.5085, 'B': -410.1157, 'C': 265.1131}),
  ee.Feature(null, {'TPWpos': 7, 'A': 1.7045, 'B': -472.4909, 'C': 270.7000}),
  ee.Feature(null, {'TPWpos': 8, 'A': 1.5886, 'B': -442.9489, 'C': 277.1511}),
  ee.Feature(null, {'TPWpos': 9, 'A': 2.0215, 'B': -571.8563, 'C': 279.9854})
]);

exports.coeff_SMW_L5 = ee.FeatureCollection([
  ee.Feature(null, {'TPWpos': 0, 'A': 0.9765, 'B': -204.6584, 'C': 211.1321}),
  ee.Feature(null, {'TPWpos': 1, 'A': 1.0229, 'B': -235.5384, 'C': 230.0619}),
  ee.Feature(null, {'TPWpos': 2, 'A': 1.0817, 'B': -261.3886, 'C': 239.5256}),
  ee.Feature(null, {'TPWpos': 3, 'A': 1.1738, 'B': -293.6128, 'C': 245.6042}),
  ee.Feature(null, {'TPWpos': 4, 'A': 1.2605, 'B': -327.1417, 'C': 254.2301}),
  ee.Feature(null, {'TPWpos': 5, 'A': 1.4166, 'B': -377.7741, 'C': 259.9711}),
  ee.Feature(null, {'TPWpos': 6, 'A': 1.5727, 'B': -430.0388, 'C': 266.9520}),
  ee.Feature(null, {'TPWpos': 7, 'A': 1.7879, 'B': -498.1947, 'C': 272.8413}),
  ee.Feature(null, {'TPWpos': 8, 'A': 1.6347, 'B': -457.8183, 'C': 279.6160}),
  ee.Feature(null, {'TPWpos': 9, 'A': 2.1168, 'B': -600.7079, 'C': 282.4583})
]);

exports.coeff_SMW_L7 = ee.FeatureCollection([
  ee.Feature(null, {'TPWpos': 0, 'A': 0.9764, 'B': -205.3511, 'C': 211.8507}),
  ee.Feature(null, {'TPWpos': 1, 'A': 1.0201, 'B': -235.2416, 'C': 230.5468}),
  ee.Feature(null, {'TPWpos': 2, 'A': 1.0750, 'B': -259.6560, 'C': 239.6619}),
  ee.Feature(null, {'TPWpos': 3, 'A': 1.1612, 'B': -289.8190, 'C': 245.3286}),
  ee.Feature(null, {'TPWpos': 4, 'A': 1.2425, 'B': -321.4658, 'C': 253.6144}),
  ee.Feature(null, {'TPWpos': 5, 'A': 1.3864, 'B': -368.4078, 'C': 259.1390}),
  ee.Feature(null, {'TPWpos': 6, 'A': 1.5336, 'B': -417.7796, 'C': 265.7486}),
  ee.Feature(null, {'TPWpos': 7, 'A': 1.7345, 'B': -481.5714, 'C': 271.3659}),
  ee.Feature(null, {'TPWpos': 8, 'A': 1.6066, 'B': -448.5071, 'C': 277.9058}),
  ee.Feature(null, {'TPWpos': 9, 'A': 2.0533, 'B': -581.2619, 'C': 280.6800})
]);

exports.coeff_SMW_L8 = ee.FeatureCollection([
  ee.Feature(null, {'TPWpos': 0, 'A': 0.9751, 'B': -205.8929, 'C': 212.7173}),
  ee.Feature(null, {'TPWpos': 1, 'A': 1.0090, 'B': -232.2750, 'C': 230.5698}),
  ee.Feature(null, {'TPWpos': 2, 'A': 1.0541, 'B': -253.1943, 'C': 238.9548}),
  ee.Feature(null, {'TPWpos': 3, 'A': 1.1282, 'B': -279.4212, 'C': 244.0772}),
  ee.Feature(null, {'TPWpos': 4, 'A': 1.1987, 'B': -307.4497, 'C': 251.8341}),
  ee.Feature(null, {'TPWpos': 5, 'A': 1.3205, 'B': -348.0228, 'C': 257.2740}),
  ee.Feature(null, {'TPWpos': 6, 'A': 1.4540, 'B': -393.1718, 'C': 263.5599}),
  ee.Feature(null, {'TPWpos': 7, 'A': 1.6350, 'B': -451.0790, 'C': 268.9405}),
  ee.Feature(null, {'TPWpos': 8, 'A': 1.5468, 'B': -429.5095, 'C': 275.0895}),
  ee.Feature(null, {'TPWpos': 9, 'A': 1.9403, 'B': -547.2681, 'C': 277.9953})
]);