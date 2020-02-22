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
    exports.default = `
    html, body {
        margin: 0;
    }
    
    p {
		margin: 1em 0 0 0;
		line-height: 1.5;
    }
    p + p {
        text-indent: 1em;
        margin: 0;
	}
	img {
		margin: 1em auto;
        display: block;
        width: 100%;
	}

    .gallery, figure {
        margin: 1em 0;
        padding: 0;
        display: block;
        list-style-type: none;
        font-size: 85%;
    }
    .gallery > * {
        display: block;
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
	a:link {
		text-decoration: none;
    }
`;
});
//# sourceMappingURL=stylescss.js.map