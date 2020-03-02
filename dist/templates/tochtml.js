"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("entities");
function tocHtmlTemplate(options, chapters) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${options.lang}" lang="${options.lang}">
<head>
    <title>Table of Contents</title>
    <meta charset="UTF-8" />
    <link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
<h1 class="h1">Table of Contents</h1>
<nav id="toc" epub:type="toc">
    <ol>
		${chapters.map((chapter, index) => {
        if (chapter.beforeToc && chapter.excludeFromToc === false) {
            return `
				<li class="table-of-contents">
                    <a href="./${chapter.filename}">${entities_1.encodeXML(chapter.title) ||
                'Chapter ' + (1 + index)}</a>${chapter.authors.length
                ? `<br/><small class="toc-author">${entities_1.encodeXML(chapter.authors.join(', '))}</small>`
                : ''}
                </li>`;
        }
    })}
		${chapters.map((chapter, index) => {
        if (chapter.beforeToc === false && chapter.excludeFromToc === false) {
            return `
				<li class="table-of-contents">
                    <a href="./${chapter.filename}">${entities_1.encodeXML(chapter.title) ||
                'Chapter ' + (1 + index)}</a>${chapter.authors.length
                ? `<br/><small class="toc-author">${entities_1.encodeXML(chapter.authors.join(', '))}</small>`
                : ''}
                </li>`;
        }
    })}
    </ol>
</nav>

</body>
</html>`;
}
exports.default = tocHtmlTemplate;
//# sourceMappingURL=tochtml.js.map