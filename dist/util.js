'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestURI = exports.browserHeaders = exports.logTracksTable = exports.makeGameTable = exports.formatKey = exports.makeDirName = exports.reportDestDir = exports.reportErr = exports.reportNoBox = exports.reportDownload = exports.reportGroup = exports.getExtension = exports.absUrl = exports.makeFileName = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _cliTable = require('cli-table3');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

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

var reportGroup = exports.reportGroup = function reportGroup(type) {
  console.log('vgmpfdl: Getting tracks for group: ' + _chalk2.default.yellow(type));
};

// Reports that a file has been downloaded.
var reportDownload = exports.reportDownload = function reportDownload(dest) {
  var destShort = dest.split('/').pop();
  console.log('vgmpfdl: Downloaded file: ' + _chalk2.default.red(destShort));
};

// Reports that this album has no box cover or was never released in a box.
var reportNoBox = exports.reportNoBox = function reportNoBox() {
  console.log('vgmpfdl: Skipping box cover: album has no box image or was never released in a box');
};

// Reports that an error occurred while downloading.
var reportErr = exports.reportErr = function reportErr(err, dest, tryA, tryZ) {
  var destShort = dest.split('/').pop();
  console.log('vgmpfdl: Error occurred while downloading: ' + _chalk2.default.red(destShort) + ' (retrying: #' + (tryA + 1) + '/' + tryZ + ')');
  if (err === true || err == null) {
    console.log('Unknown error.');
  } else if (err) {
    var code = err.code;
    var name = err.name;
    var stack = err.stack;
    console.log('' + (name ? 'Name: ' + name + '; ' : '') + (code ? 'Code: ' + code + '; ' : '') + (stack ? 'Details follow:\n' + stack : ''));
  }
};

// Reports the destination directory.
var reportDestDir = exports.reportDestDir = function reportDestDir(dir) {
  return console.log('vgmpfdl: Saving to ' + _chalk2.default.green(dir));
};

/**
 * Returns the name of the directory we'll download the files to.
 */
var makeDirName = exports.makeDirName = function makeDirName(title, info, composers, group) {
  var segments = [title];
  if (info.platform && info.year) {
    segments.push('(' + info.platform + ', ' + info.year + ')');
  } else if (info.platform) {
    segments.push('(' + info.platform + ')');
  } else if (info.year) {
    segments.push('(' + info.year + ')');
  }
  if (composers && composers.length) {
    segments.push(composers.join(', '));
  }
  if (info.developer) {
    segments.push('[' + info.developer + ']');
  }
  if (group) {
    segments.push('[' + group.replace(/^\s?-\s?/, '') + ']');
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
var makeGameTable = exports.makeGameTable = function makeGameTable(title, info, composers) {
  var table = new _cliTable2.default();
  table.push.apply(table, [_defineProperty({}, _chalk2.default.red('Title'), title)].concat(_toConsumableArray(info.platform ? [_defineProperty({}, _chalk2.default.red('Platform'), info.platform)] : []), _toConsumableArray(info.year ? [_defineProperty({}, _chalk2.default.red('Year'), info.year)] : []), _toConsumableArray(info.developer ? [_defineProperty({}, _chalk2.default.red('Developer'), info.developer)] : [])));
  if (composers) {
    table.push(_defineProperty({}, _chalk2.default.red('Composer' + (composers.length !== 1 ? 's' : '')), composers.join(', ')));
  }
  return table;
};

/**
 * Make a table out of the tracks we found.
 */
var logTracksTable = exports.logTracksTable = function logTracksTable(trackGroups) {
  var allTables = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = trackGroups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var group = _step.value;

      var table = new _cliTable2.default({ head: ['#', 'Title', 'Composer', 'Length'] });
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = group.tracks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var track = _step3.value;

          table.push([track.trackN, track.title, track.composer, track.length]);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      allTables.push([group.group, table.toString()]);
    }
    // Now log all tables with a group header.
    // This is a pretty big hack, because we can't span columns with cli-table.
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = allTables[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var table = _step2.value;

      var groupName = table[0];
      var tableString = table[1];
      // Here's the big hack to get the size of the table.
      var rowLength = tableString.split('\n')[0].replace(/[^┌─┐┬]/g, '');
      if (groupName) {
        var tableObj = new _cliTable2.default({ colWidths: [rowLength.length - 2] });
        tableObj.push([_chalk2.default.yellow(groupName.replace(/^\s?-\s?/, ''))]);
        console.log(tableObj.toString());
      }
      console.log(tableString);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
};

// Headers similar to what a regular browser would send.
var browserHeaders = exports.browserHeaders = {
  'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,nl;q=0.7,de;q=0.6,es;q=0.5,it;q=0.4,pt;q=0.3',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
  // Default settings for requests.
};var requestDefaults = {
  gzip: true

  // Requests a URI using our specified browser headers as defaults.
  // This function has a higher chance of being permitted by the source site
  // since it's designed to look like a normal browser request rather than a script.
};var requestURI = exports.requestURI = function requestURI(url) {
  var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var etc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return new Promise(function (resolve, reject) {
    return (0, _request2.default)(_extends({ url: url, headers: _extends({}, browserHeaders, headers != null ? headers : {}) }, requestDefaults, etc), function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
};