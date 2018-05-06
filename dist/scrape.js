'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadVGMPFUrl = exports.isVGMPFUrl = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _requestAsBrowser = require('requestAsBrowser');

var _requestAsBrowser2 = _interopRequireDefault(_requestAsBrowser);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _download = require('./download');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Valid URL we can scrape.
var VGMPF_URL = new RegExp('vgmpf\\.com/Wiki/index\\.php\\?title=(.+?)', 'i');
// Color of the header that contains the game title.
var HEADER_COLOR = '#402070';

var isVGMPFUrl = exports.isVGMPFUrl = function isVGMPFUrl(url) {
  return VGMPF_URL.test(url);
};

var downloadVGMPFUrl = exports.downloadVGMPFUrl = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
    var html, $, $content, tracks, composerNum, composers, $gameTitle, $gameBox, gameInfo, gameTitle, gameImage, dirName, dirPath, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, track, _ext, fn, _dest, ext, dest;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _requestAsBrowser2.default)(url);

          case 2:
            html = _context.sent;
            $ = _cheerio2.default.load(html.body);

            // Retrieve the list of tracks.

            $content = $('#mw-content-text');
            tracks = $('.wikitable tr[itemtype="http://schema.org/MusicComposition"]', $content).map(function (n, el) {
              var trackN = $('td:first-child', el).text().trim();
              var title = $('td:nth-child(2)', el).text().trim();
              var composer = $('td:nth-child(3)', el).text().trim();
              var length = $('td:nth-child(4)', el).text().trim();
              var url = (0, _util.absUrl)($('td:nth-child(6) a', el).attr('href').trim());
              var album = $('td:nth-child(6) span[itemprop="inAlbum"] meta[itemprop="name"]', el).attr('content').trim();
              return {
                trackN: trackN,
                title: title,
                composer: composer,
                length: length,
                url: url,
                album: album
              };
            }).get();

            // Retrieve list of composers, sorted by most number of credited tracks.

            composerNum = tracks.reduce(function (acc, curr) {
              return _defineProperty({}, curr.composer, acc[curr.composer] ? acc[curr.composer] + 1 : 1);
            }, {});
            composers = Object.keys(composerNum).sort(function (a, b) {
              return composerNum[a] < composerNum[b];
            });

            // Retrieve main game information table. There's no clean way to do this,
            // but the color we search for is at least locked and doesn't seem like it will change soon.

            $gameTitle = $('td[style*="' + HEADER_COLOR + '"]').slice(0, 1);
            // Then traverse up to its containing table.

            $gameBox = $gameTitle.parents('table');

            // This is guaranteed to be the third <tr> by the Wikitemplate.

            gameInfo = $('tr:nth-child(3) table tr', $gameBox).map(function (n, el) {
              return _defineProperty({}, (0, _util.formatKey)($('td:nth-child(1)', el).text().trim()), $('td:nth-child(2)', el).text().trim());
            }).get().reduce(function (acc, curr) {
              return _extends({}, acc, curr);
            }, {});
            gameTitle = $gameTitle.text().trim();
            gameImage = (0, _util.absUrl)($('a.image img', $gameBox).attr('src').trim());
            dirName = (0, _util.makeDirName)(gameTitle, gameInfo);
            dirPath = process.cwd() + '/' + dirName + '/';


            console.log((0, _util.makeGameTable)(gameTitle, gameInfo).toString());
            console.log((0, _util.makeTracksTable)(tracks).toString());
            console.log('vgmpfdl: Saving to ' + dirPath);

            // Start saving files.
            (0, _mkdirp2.default)(dirPath, function (err) {
              if (err) {
                console.log('vgmpfdl: error: Could not create path');
                process.exit(1);
              }
            });

            // Download all tracks. Let's be nice and do it one at a time.
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 22;
            _iterator = tracks[Symbol.iterator]();

          case 24:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 35;
              break;
            }

            track = _step.value;
            _ext = (0, _util.getExtension)(track.url);
            fn = (0, _util.makeFileName)(track.trackN, track.title, _ext);
            _dest = '' + dirPath + fn;
            _context.next = 31;
            return (0, _download.downloadFile)(track.url, _dest);

          case 31:
            (0, _util.reportDownload)(_dest);

          case 32:
            _iteratorNormalCompletion = true;
            _context.next = 24;
            break;

          case 35:
            _context.next = 41;
            break;

          case 37:
            _context.prev = 37;
            _context.t0 = _context['catch'](22);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 41:
            _context.prev = 41;
            _context.prev = 42;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 44:
            _context.prev = 44;

            if (!_didIteratorError) {
              _context.next = 47;
              break;
            }

            throw _iteratorError;

          case 47:
            return _context.finish(44);

          case 48:
            return _context.finish(41);

          case 49:

            // Download the cover image to 'folder.ext'.
            ext = (0, _util.getExtension)(gameImage);
            dest = dirPath + 'folder.' + ext;
            _context.next = 53;
            return (0, _download.downloadFile)(gameImage, dest);

          case 53:
            (0, _util.reportDownload)(dest);

          case 54:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[22, 37, 41, 49], [42,, 44, 48]]);
  }));

  return function downloadVGMPFUrl(_x) {
    return _ref.apply(this, arguments);
  };
}();