'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _scrape = require('./scrape');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * vgmpfdl - VGMPF Scraper <https://github.com/msikma/vgmpfdl>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var run = exports.run = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(args) {
    var urls, composer, dryRun, exitCode, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, url;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            urls = args.urls, composer = args.composer, dryRun = args.dryRun;
            exitCode = 0;


            if (urls.length === 0) {
              console.log('vgmpfdl: error: no URL entered');
              process.exit(1);
            }

            _context.prev = 3;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 7;
            _iterator = urls[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 21;
              break;
            }

            url = _step.value;

            if (!(0, _scrape.isVGMPFUrl)(url)) {
              _context.next = 16;
              break;
            }

            _context.next = 14;
            return (0, _scrape.downloadVGMPFUrl)(url, composer, dryRun);

          case 14:
            _context.next = 18;
            break;

          case 16:
            console.log('vgmpfdl: error: not a recognized URL scheme: ' + url);
            exitCode = 1;

          case 18:
            _iteratorNormalCompletion = true;
            _context.next = 9;
            break;

          case 21:
            _context.next = 27;
            break;

          case 23:
            _context.prev = 23;
            _context.t0 = _context['catch'](7);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 27:
            _context.prev = 27;
            _context.prev = 28;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 30:
            _context.prev = 30;

            if (!_didIteratorError) {
              _context.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context.finish(30);

          case 34:
            return _context.finish(27);

          case 35:
            _context.next = 40;
            break;

          case 37:
            _context.prev = 37;
            _context.t1 = _context['catch'](3);

            if (_context.t1.statusCode === 404) {
              console.log('vgmpfdl: error: given URL returned a page not found error (404)');
              exitCode = 1;
            } else {
              console.log('vgmpfdl: error: ' + _context.t1.stack);
              exitCode = 1;
            }

          case 40:
            return _context.abrupt('return', process.exit(exitCode));

          case 41:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[3, 37], [7, 23, 27, 35], [28,, 30, 34]]);
  }));

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();