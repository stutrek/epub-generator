"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("entities");
const encodeXML = (str) => {
    return entities_1.encodeXML(str || '');
};
function tocHtmlTemplate(chapter, options, docHeader) {
    const injectTitle = options.title && options.injectChapterTitles;
    const injectAuthor = injectTitle && chapter.authors.length;
    const injectLink = injectTitle && chapter.url;
    return `${docHeader}
		<head>
		<meta charset="UTF-8" />
		<title>${encodeXML(options.title || '')}</title>
			<link rel="stylesheet" type="text/css" href="style.css" />
		</head>
		<body>
			${injectTitle ? `<h1>${encodeXML(chapter.title)}</h1>` : ''}
			${injectAuthor ? `<div class="epub-author">${encodeXML(chapter.authors.join(', '))}</div>` : ''}
			${injectLink
        ? `<div class="epub-link"><a href="${encodeXML(chapter.url)}">View on web</a></div>`
        : ''}
			${chapter.data}
		</body>
		</html>`;
}
exports.default = tocHtmlTemplate;
//# sourceMappingURL=chapterhtml.js.map