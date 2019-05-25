'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadVGMPFUrl = exports.isVGMPFUrl = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _util = require('./util');

var _download = require('./download');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Valid URL we can scrape.
var VGMPF_URL = [new RegExp('vgmpf\\.com/Wiki/index\\.php\\?title=(.+?)', 'i'), new RegExp('vgmpf\\.com/Wiki/index\\.php/(.+?)', 'i')];
// Color of the header that contains the game title.
var HEADER_COLOR = '#402070';

// Displays an error if we couldn't make a path.
var pathError = function pathError(err) {
  if (err) {
    console.log('vgmpfdl: error: Could not create path');
    process.exit(1);
  }
};

// Returns whether the box image is the standard 'no box' image.
// </Wiki/images/thumb/5/53/NoBox.png/250px-NoBox.png>
var imageIsNoBox = function imageIsNoBox(url) {
  return url.indexOf('250px-NoBox') > -1 || url.indexOf('NoBox.png') > -1;
};

var isVGMPFUrl = exports.isVGMPFUrl = function isVGMPFUrl(url) {
  return VGMPF_URL.map(function (re) {
    return re.test(url);
  }).indexOf(true) > -1;
};

var downloadVGMPFUrl = exports.downloadVGMPFUrl = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, showComposers) {
    var html, $, $content, $ols, ols, cols, findCol, $tables, groups, trackGroups, tracks, composerNum, composers, $gameTitle, $gameBox, gameInfo, gameTitle, gameImage, dirPathBase, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, group, dirName, dirPath, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, track, a, _ext, fn, _dest, ext, dest;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _util.requestURI)(url);

          case 2:
            html = _context.sent;
            $ = _cheerio2.default.load(html.body);

            // Retrieve the list of tracks.

            $content = $('#mw-content-text');

            // Attempt to determine if there's a list of output prefixes.
            // For example, an article might have four different recordings of the soundtrack,
            // one using OPL2, one using Gravis, etc.
            // If we find an ordered list with the same amount of items as the track tables we've found,
            // we'll assume that this ordered list contains the various different chips.

            $ols = $('ol', $content);
            // Produces e.g. 
            //    [ [ '- Gravis UltraSound (using original patch set)',
            //        '- Gravis UltraSound (using "Pro Patches Lite" v1.60 )',
            //        '- Roland SoundCanvas (General MIDI / Wave Blaster)',
            //        '- OPL2 (Sound Blaster / Ad Lib)' ] ]

            ols = $ols.get().map(function (ol) {
              return $('li', ol).get().map(function (li) {
                return $(li).text().trim();
              });
            });

            // Determine which columns we have. Also define a quick helper function for getting the right column index.

            cols = $('.wikitable tr:first-child th').map(function (n, el) {
              return $(el).text().trim();
            }).get();

            findCol = function findCol(str) {
              return cols.indexOf(str) + 1;
            };

            $tables = $('.wikitable', $content);
            // See if we have a list of recording groups.

            groups = $tables.get().length > 1 && ols.length ? ols.find(function (ol) {
              return ol.length === $tables.get().length;
            }) : [];
            trackGroups = $tables.get().map(function (table, n) {
              var group = groups.length >= n + 1 ? groups[n] : '';
              var $trs = $('tr[itemtype="http://schema.org/MusicComposition"]', table);
              var tracks = $trs.map(function (_, el) {
                var trackN = $('td:nth-child(' + findCol('#') + ')', el).text().trim();
                var title = $('td:nth-child(' + findCol('Title') + ')', el).text().trim();
                var composer = $('td:nth-child(' + findCol('Composer') + ')', el).text().trim();
                var length = $('td:nth-child(' + findCol('Length') + ')', el).text().trim();
                var url = (0, _util.absUrl)($('td:nth-child(' + findCol('Download') + ') a', el).attr('href').trim());
                var album = $('td:nth-child(' + findCol('Download') + ') span[itemprop="inAlbum"] meta[itemprop="name"]', el).attr('content').trim();
                return {
                  group: group,
                  trackN: trackN,
                  title: title,
                  composer: composer,
                  length: length,
                  url: url,
                  album: album
                };
              });
              return {
                group: group,
                tracks: tracks.get()
              };
            });
            tracks = trackGroups.reduce(function (all, group) {
              return [].concat(_toConsumableArray(all), _toConsumableArray(group.tracks));
            }, []);

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

            gameInfo = $('tr:nth-child(3) table tr', $gameBox).map(function (_, el) {
              return _defineProperty({}, (0, _util.formatKey)($('td:nth-child(1)', el).text().trim()), $('td:nth-child(2)', el).text().trim());
            }).get().reduce(function (acc, curr) {
              return _extends({}, acc, curr);
            }, {});
            gameTitle = $gameTitle.text().trim();
            gameImage = (0, _util.absUrl)($('a.image img', $gameBox).attr('src').trim());
            dirPathBase = process.cwd() + '/';


            console.log((0, _util.makeGameTable)(gameTitle, gameInfo, composers).toString());
            (0, _util.logTracksTable)(trackGroups);

            // Download all tracks. Let's be nice and do it one at a time.
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 26;
            _iterator = trackGroups[Symbol.iterator]();

          case 28:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 88;
              break;
            }

            group = _step.value;
            dirName = (0, _util.makeDirName)(gameTitle, gameInfo, showComposers ? composers : [], group.group);
            dirPath = '' + dirPathBase + dirName;

            (0, _util.reportDestDir)(dirPath);
            (0, _mkdirp2.default)(dirPath, pathError);
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 37;
            _iterator2 = group.tracks[Symbol.iterator]();

          case 39:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context.next = 62;
              break;
            }

            track = _step2.value;
            a = 0;

          case 42:
            if (!(a < 5)) {
              _context.next = 59;
              break;
            }

            _ext = (0, _util.getExtension)(track.url);
            fn = (0, _util.makeFileName)(track.trackN, track.title, _ext);
            _dest = dirPath + '/' + fn;
            _context.prev = 46;
            _context.next = 49;
            return (0, _download.downloadFile)(track.url, _dest);

          case 49:
            (0, _util.reportDownload)(_dest);
            return _context.abrupt('break', 59);

          case 53:
            _context.prev = 53;
            _context.t0 = _context['catch'](46);

            (0, _util.reportErr)(_context.t0, _dest, a, 5);

          case 56:
            ++a;
            _context.next = 42;
            break;

          case 59:
            _iteratorNormalCompletion2 = true;
            _context.next = 39;
            break;

          case 62:
            _context.next = 68;
            break;

          case 64:
            _context.prev = 64;
            _context.t1 = _context['catch'](37);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 68:
            _context.prev = 68;
            _context.prev = 69;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 71:
            _context.prev = 71;

            if (!_didIteratorError2) {
              _context.next = 74;
              break;
            }

            throw _iteratorError2;

          case 74:
            return _context.finish(71);

          case 75:
            return _context.finish(68);

          case 76:

            // Download the cover image to 'folder.ext'.
            ext = (0, _util.getExtension)(gameImage);
            dest = dirPath + '/folder.' + ext;

            if (imageIsNoBox(gameImage)) {
              _context.next = 84;
              break;
            }

            _context.next = 81;
            return (0, _download.downloadFile)(gameImage, dest);

          case 81:
            (0, _util.reportDownload)(dest);
            _context.next = 85;
            break;

          case 84:
            (0, _util.reportNoBox)();

          case 85:
            _iteratorNormalCompletion = true;
            _context.next = 28;
            break;

          case 88:
            _context.next = 94;
            break;

          case 90:
            _context.prev = 90;
            _context.t2 = _context['catch'](26);
            _didIteratorError = true;
            _iteratorError = _context.t2;

          case 94:
            _context.prev = 94;
            _context.prev = 95;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 97:
            _context.prev = 97;

            if (!_didIteratorError) {
              _context.next = 100;
              break;
            }

            throw _iteratorError;

          case 100:
            return _context.finish(97);

          case 101:
            return _context.finish(94);

          case 102:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[26, 90, 94, 102], [37, 64, 68, 76], [46, 53], [69,, 71, 75], [95,, 97, 101]]);
  }));

  return function downloadVGMPFUrl(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();