"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tocNcxTemplate(config, chapters) {
    let playOrder = 0;
    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${config.uuid}" />
        <meta name="dtb:generator" content="epub-gen"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${config.title}</text>
	</docTitle>
	${config.authors.length
        ? `
    <docAuthor>
        <text>${config.authors.join(', ')}</text>
	</docAuthor>
	`
        : ''}
    <navMap>
		${chapters.map((chapter, index) => {
        if (chapter.beforeToc && chapter.excludeFromToc === false) {
            return `
				<navPoint id="content_${index}" playOrder="${playOrder++}" class="chapter">
                    <navLabel>
                        <text>${1 + index}. ${chapter.title || 'Chapter ' + (1 + index)}</text>
                    </navLabel>
                    <content src="./OEBPS/${chapter.filename}>"/>
                </navPoint>`;
        }
    })}

        <navPoint id="toc" playOrder="${playOrder++}" class="chapter">
            <navLabel>
                <text>Table of Contents</text>
            </navLabel>
            <content src="./OEBPS/toc.xhtml"/>
        </navPoint>
		${chapters.map((chapter, index) => {
        if (chapter.beforeToc === false && chapter.excludeFromToc === false) {
            return `
				<navPoint id="content_${index}" playOrder="${playOrder++}" class="chapter">
                    <navLabel>
                        <text>${1 + index}. ${chapter.title || 'Chapter ' + (1 + index)}</text>
                    </navLabel>
                    <content src="./OEBPS/${chapter.filename}"/>
                </navPoint>`;
        }
    })}
    </navMap>
</ncx>`;
}
exports.default = tocNcxTemplate;
//# sourceMappingURL=tocncx.js.map