import { ResolvedChapter, EPubOptions } from '../types';
import { encodeXML as unsafeEncodeXML } from 'entities';

const encodeXML = (str: string) => {
    return unsafeEncodeXML(str || '');
};

export default function tocHtmlTemplate(
    chapter: ResolvedChapter,
    options: EPubOptions,
    docHeader: string
) {
    const injectTitle = options.title && options.injectChapterTitles;
    const injectAuthor = injectTitle && chapter.authors.length;
    const injectLink = injectTitle && chapter.url;
    return /*html */ `${docHeader}
		<head>
		<meta charset="UTF-8" />
		<title>${encodeXML(options.title || '')}</title>
			<link rel="stylesheet" type="text/css" href="style.css" />
		</head>
		<body>
			${injectTitle ? `<h1>${encodeXML(chapter.title)}</h1>` : ''}
			${injectAuthor ? `<div class="epub-author">${encodeXML(chapter.authors.join(', '))}</div>` : ''}
			${
                injectLink
                    ? `<div class="epub-link"><a href="${encodeXML(
                          chapter.url
                      )}">View on web</a></div>`
                    : ''
            }
			${chapter.data}
		</body>
		</html>`;
}
