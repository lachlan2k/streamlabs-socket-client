'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var removeCommas = exports.removeCommas = function removeCommas(str) {
  return str.toString().replace(/,/g, '');
};

var removeNonNumeric = exports.removeNonNumeric = function removeNonNumeric(str) {
  return str.toString().replace(/[^0-9.]/g, '');
};
//# sourceMappingURL=helpers.js.map