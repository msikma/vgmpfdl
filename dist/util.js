'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeTracksTable = exports.makeGameTable = exports.formatKey = exports.makeDirName = exports.reportDestDir = exports.reportDownload = exports.getExtension = exports.absUrl = exports.makeFileName = undefined;

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _cliTable = require('cli-table2');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
                                                                                                                                                                                                     * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                     */

var VGMPF_BASE = 'http://www.vgmpf.com';

// Returns the name of the file we'll save for a single track.
var makeFileName = exports.makeFileName = function makeFileName(n, title, ext) {
  return (0, _sanitizeFilename2.default)(n + ' - ' + title + '.' + ext);
};

// Makes a URL absolute if it isn't already.
var absUrl = exports.absUrl = function absUrl(url) {
  return url.startsWith(VGMPF_BASE) ? url : '' + VGMPF_BASE + url;
};

// Returns the file extension of a URL.
var getExtension = exports.getExtension = function getExtension(url) {
  return url.split('.').pop();
};

// Reports that a file has been downloaded.
var reportDownload = exports.reportDownload = function reportDownload(dest) {
  var destShort = dest.split('/').pop();
  console.log('vgmpfdl: Downloaded file: ' + _chalk2.default.red(destShort));
};

// Reports the destination directory.
var reportDestDir = exports.reportDestDir = function reportDestDir(dir) {
  return console.log('vgmpfdl: Szaving to ' + _chalk2.default.red(dir));
};

/**
 * Returns the name of the directory we'll download the files to.
 */
var makeDirName = exports.makeDirName = function makeDirName(title, info, composers) {
  var segments = [title];
  if (info.platform && info.year) {
    segments.push('(' + info.platform + ', ' + info.year + ')');
  } else if (info.platform) {
    segments.push('(' + info.platform + ')');
  } else if (info.year) {
    segments.push('(' + info.year + ')');
  }
  if (composers) {
    segments.push(composers.join(', '));
  }
  if (info.developer) {
    segments.push('[' + info.developer + ']');
  }
  return (0, _sanitizeFilename2.default)(segments.join(' '));
};

/**
 * Turns a table key like 'Developer:' into 'developer'.
 */
var formatKey = exports.formatKey = function formatKey(str) {
  return str.split(':').join('').toLowerCase();
};

/**
 * Make a table containing basic game information.
 */
var makeGameTable = exports.makeGameTable = function makeGameTable(title, info) {
  var table = new _cliTable2.default();
  table.push.apply(table, [_defineProperty({}, _chalk2.default.red('Title'), title)].concat(_toConsumableArray(info.platform ? [_defineProperty({}, _chalk2.default.red('Platform'), info.platform)] : []), _toConsumableArray(info.year ? [_defineProperty({}, _chalk2.default.red('Year'), info.year)] : []), _toConsumableArray(info.developer ? [_defineProperty({}, _chalk2.default.red('Developer'), info.developer)] : [])));
  return table;
};

/**
 * Make a table out of the tracks we found.
 */
var makeTracksTable = exports.makeTracksTable = function makeTracksTable(tracks) {
  var table = new _cliTable2.default({ head: ['#', 'Title', 'Composer', 'Length'] });
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      table.push([track.trackN, track.title, track.composer, track.length]);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return table;
};