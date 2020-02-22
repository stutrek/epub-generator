(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAMAAADQmBKKAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURcnJyf///93d3erq6vz8/Pn5+fb29s7OzvLy8tXV1e7u7tDQ0ODg4Ofn59ra2szMzFWxkN4AAAGZSURBVHja7dSLiuMwDAVQyZIc+SH7//927aTtLIUBhnRhFu6B0KDI9m0cTAQAAAAAAAAAAAAAAAAAAAAAAADwu8z5T6aV/NMRJZ0/XeXbOeuNQNV+OiKuEe7t20B+L5C4m4TlRFMsC1HxLD5ouNVz0eGrPvZTkzmU93qh2q/CzIXW9WrKbjcDObuzihmFRnAnszBOhbPo+TY6W6iRcA2W5rz3bKiPq3DwoHV9NTnfDaR0sFDnOXobGoULDU7C5ejrdgcq+ykLUdXnlmWhq/AKdDZZJdK7gSpNTpR4bwdzdJ674LyNMxBR4sKdKPgrULsKO1DbgV5N9WOBLJepsf9r4VS5tRLzFejQONd6BZpX4eBE4xnobLKPBVIvwVLYh3PqHMP1K9CsloYGhZbHlj0K6iM/A62mHre+ITGq8gzUlc25pMx5FSqznmdOutYqxpwPGnq+Ihd6FILZeTyblPnWN/R2+jaio0mbhQvRUd4O49LejuhH4fh7ivL5E9ysaqZfpHXpkwAAAAAAAAAAAAAAAAAAAAAA4P/3B92SDi1pBPz/AAAAAElFTkSuQmCC`;
});
//# sourceMappingURL=notfound-minpng.js.map