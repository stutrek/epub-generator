import { EPubOptions, ResolvedChapter } from '../types';
import { encodeXML } from 'entities';

export default function tocNcxTemplate(config: EPubOptions, chapters: ResolvedChapter[]) {
    let playOrder = 0;
    return /* html */ `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${config.uuid}" />
        <meta name="dtb:generator" content="epub-gen"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${encodeXML(config.title)}</text>
	</docTitle>
	${
        config.authors.length
            ? `
    <docAuthor>
        <text>${encodeXML(config.authors.join(', '))}</text>
	</docAuthor>
	`
            : ''
    }
    <navMap>
		${chapters.map((chapter, index) => {
            if (chapter.beforeToc && chapter.excludeFromToc === false) {
                return `
				<navPoint id="content_${index}" playOrder="${playOrder++}" class="chapter">
                    <navLabel>
                        <text>${1 + index}. ${encodeXML(chapter.title) ||
                    'Chapter ' + (1 + index)}</text>
                    </navLabel>
                    <content src="./${chapter.filename}>"/>
                </navPoint>`;
            }
        })}
        ${
            config.useToc
                ? `<navPoint id="toc" playOrder="${playOrder++}" class="chapter">
            <navLabel>
                <text>Table of Contents</text>
            </navLabel>
            <content src="./toc.xhtml"/>
        </navPoint>`
                : ''
        }
		${chapters.map((chapter, index) => {
            if (chapter.beforeToc === false && chapter.excludeFromToc === false) {
                return `
				<navPoint id="content_${index}" playOrder="${playOrder++}" class="chapter">
                    <navLabel>
                        <text>${1 + index}. ${encodeXML(chapter.title) ||
                    'Chapter ' + (1 + index)}</text>
                    </navLabel>
                    <content src="./${chapter.filename}"/>
                </navPoint>`;
            }
        })}
    </navMap>
</ncx>`;
}
