import { parse, TextNode, HTMLElement } from 'node-html-parser';
import { encodeXML } from 'entities';

import { remove as removeDiacritics } from 'diacritics';

import loadImages from './loadImages';
import { allowedAttributes, allowedXhtml11Tags } from './allowedAttributesAndTags';
import { EPubOptions, ChapterInput, ResolvedChapter } from './types';

import styleSheet from './templates/stylescss';
import chapterHtml from './templates/chapterhtml';
import containerXml from './templates/containerxml';
import contentOpf from './templates/contentopf';
import tocHtml from './templates/tochtml';
import tocNcx from './templates/tocncx';

const getHeader = (version: 2 | 3, lang: string) => {
    if (version === 2) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">\
`;
    } else {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}">\
`;
    }
};

const createChapterHtml = (htmlFragment: string, chapter: ChapterInput, options: EPubOptions) => {
    const injectTitle = options.title && options.injectChapterTitles;
    const injectAuthor = injectTitle && chapter.authors.length;
    const injectLink = injectTitle && chapter.url;
    return /*html */ `${getHeader(options.version || 3, options.lang)}
		<head>
		<meta charset="UTF-8" />
		<title>${encodeXML(options.title || '')}</title>
			<link rel="stylesheet" type="text/css" href="style.css" />
		</head>
		<body>
			${injectTitle ? `<h1>${encodeXML(chapter.title)}</h1>` : ''}
			${injectAuthor ? `<div class="epub-author">${encodeXML(chapter.authors.join(', '))}</div>` : ''}
			${injectLink ? `<div class="epub-link"><a href="${chapter.url}">View on}</a></div>` : ''}
			${htmlFragment}
		</body>
		</html>
		`;
};

export default async function createEpub(options: EPubOptions) {
    const images = new Map<string, string>();
    let imageCount = 1;

    if (typeof options.cover === 'string') {
        const filename = options.cover.split('.').pop();
        images.set(options.cover, `cover_${filename}`);
    }

    const resolvedChapters: ResolvedChapter[] = options.content.map(function(content, index) {
        const slug = removeDiacritics(content.title || 'no title').replace(/\W/g, '-');

        let root:
            | (TextNode & {
                  valid: boolean;
              })
            | (
                  | (HTMLElement & {
                        valid: boolean;
                    })
                  | HTMLElement
              ) = parse(content.data, {
            lowerCaseTagName: true,
        });

        if (root instanceof HTMLElement) {
            if (root.querySelector('body')) {
                root = root.querySelector('body');
                root.tagName = 'div';
            }

            const elements = root.querySelectorAll('*');

            const imageElements = root.querySelectorAll('img');

            for (const image of imageElements) {
                let url = image.getAttribute('src');
                if (url.startsWith('http') === false) {
                    continue;
                }

                if (image.hasAttribute('width') && Number(image.getAttribute('width')) < 5) {
                    console.log(image.parentNode);
                    const remover = image.parentNode || root;
                    // @ts-ignore does so exist
                    remover.removeChild(image);
                    continue;
                }

                if (images.has(url) === false) {
                    const extension = url
                        .replace(/[?#].*/, '')
                        .split('.')
                        .pop();
                    images.set(url, `image_${imageCount}.${extension}`);
                    imageCount += 1;
                }
                image.setAttribute('src', `./images/${images.get(url)}`);

                if (image.hasAttribute('alt') === false || !image.getAttribute('alt')) {
                    image.setAttribute('alt', 'alt');
                }

                image.removeAttribute('srcset');
            }

            for (const element of elements) {
                for (const attr in element.attributes) {
                    if (allowedAttributes.has(attr) === false) {
                        element.removeAttribute(attr);
                    }
                }
                if (options.version === 2 && allowedXhtml11Tags.has(element.tagName) === false) {
                    element.tagName = 'div';
                }
            }
        }

        return {
            title: content.title,
            filename: `${'index'.padStart(3, '0')}_${slug}.xhtml`,
            excludeFromToc: !!content.excludeFromToc,
            beforeToc: content.beforeToc === true,
            authors: content.authors,
            data: 'outerHTML' in root ? root.outerHTML : root.text,
            url: content.url,
        };
    });

    const imagesPromise = loadImages(images);

    const files = new Map<string, string | ArrayBuffer>();

    files.set('/META-INF/container.xml', containerXml);
    files.set('/OEBPS/style.css', styleSheet);
    files.set('/OEBPS/content.opf', contentOpf(options, resolvedChapters, images));
    files.set('/OEBPS/toc.ncx', tocNcx(options, resolvedChapters));
    files.set('/OEBPS/toc.xhtml', tocHtml(options, resolvedChapters));
    resolvedChapters.forEach(chapter => {
        files.set(
            '/OEBPS/' + chapter.filename,
            chapterHtml(chapter, options, getHeader(options.version, options.lang))
        );
    });

    const resolvedImages = await imagesPromise;
    for (const [filename, blob] of resolvedImages) {
        files.set(`/OEBPS/images/${filename}`, blob);
    }

    return files;
}
