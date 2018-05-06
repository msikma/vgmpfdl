'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadFile = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Downloads a file.
 */
/**
 * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
 * Copyright © 2018, Michiel Sikma
 */

var downloadFile = exports.downloadFile = function downloadFile(src, dest) {
  return new Promise(function (resolve, reject) {
    var destStream = _fs2.default.createWriteStream(dest, { flags: 'w', encoding: null });
    destStream.on('finish', resolve);
    (0, _request2.default)(src).pipe(destStream);
  });
};