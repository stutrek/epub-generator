"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("entities");
function tocHtmlTemplate(chapter, options, docHeader) {
    const injectTitle = options.title && options.injectChapterTitles;
    const injectAuthor = injectTitle && chapter.authors.length;
    const injectLink = injectTitle && chapter.url;
    return `${docHeader}
		<head>
		<meta charset="UTF-8" />
		<title>${entities_1.encodeXML(options.title || '')}</title>
			<link rel="stylesheet" type="text/css" href="style.css" />
		</head>
		<body>
			${injectTitle ? `<h1>${entities_1.encodeXML(chapter.title)}</h1>` : ''}
			${injectAuthor ? `<div class="epub-author">${entities_1.encodeXML(chapter.authors.join(', '))}</div>` : ''}
			${injectLink
        ? `<div class="epub-link"><a href="${entities_1.encodeXML(chapter.url)}">View on web</a></div>`
        : ''}
			${chapter.data}
		</body>
		</html>`;
}
exports.default = tocHtmlTemplate;
//# sourceMappingURL=chapterhtml.js.map