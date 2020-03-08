import sanitizeHtml from 'sanitize-html';
import { remove as removeDiacritics } from 'diacritics';

import { allowedAttributes, allowedXhtml11Tags } from './allowedAttributesAndTags';
import { EPubOptions, ResolvedChapter } from './types';

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

type ImageLoader = (files: Map<string, string>) => Promise<Map<string, ArrayBuffer>>;

export default async function createEpub(options: EPubOptions, loadImages: ImageLoader) {
    const images = new Map<string, string>();
    let imageCount = 1;

    if (typeof options.cover === 'string') {
        const filename = options.cover.split('.').pop();
        images.set(options.cover, `cover_${filename}`);
    }

    const resolvedChapters: ResolvedChapter[] = options.content.map(function(content, index) {
        const slug = removeDiacritics(content.title || 'no title').replace(/\W/g, '-');

        const sanitizeConfig: sanitizeHtml.IOptions = {
            allowedAttributes: {
                '*': allowedAttributes,
                img: ['src', ...allowedAttributes],
            },
            allowedTags: allowedXhtml11Tags,
            exclusiveFilter: frame => {
                if (frame.tag === 'iframe') {
                    return true;
                }
                if (frame.tag === 'img') {
                    if ('width' in frame.attribs) {
                        return Number(frame.attribs.width) > 60;
                    }
                }
                return false;
            },
            transformTags: {
                img: (tagName, attribs) => {
                    const url = attribs.src;
                    if ('width' in attribs && Number(attribs.width) < 60) {
                        return {
                            tagName: 'span',
                            attribs: {},
                        };
                    }
                    if (url.startsWith('http')) {
                        if (images.has(url) === false) {
                            const extension = url
                                .replace(/[?#].*/, '')
                                .split('.')
                                .pop();
                            images.set(url, `image_${imageCount}.${extension}`);
                            imageCount += 1;
                        }
                        attribs.src = `./images/${images.get(url)}`;

                        if (!attribs.alt) {
                            attribs.alt = ' ';
                        }
                    }
                    return {
                        tagName,
                        attribs,
                    };
                },
            },
        };
        const cleanHtml = sanitizeHtml(`<div>${content.data.trim()}</div>`, sanitizeConfig);

        return {
            title: content.title,
            filename: `${`${index}`.padStart(3, '0')}_${slug}.xhtml`,
            excludeFromToc: !!content.excludeFromToc,
            beforeToc: content.beforeToc === true,
            authors: content.authors,
            data: cleanHtml,
            url: content.url,
        };
    });

    const imagesPromise = loadImages(images);

    const files = new Map<string, string | ArrayBuffer>();

    files.set('/META-INF/container.xml', containerXml);
    files.set('/OEBPS/style.css', styleSheet);
    files.set('/OEBPS/content.opf', contentOpf(options, resolvedChapters, images));
    files.set('/OEBPS/toc.ncx', tocNcx(options, resolvedChapters));
    if (options.useToc !== false) {
        files.set('/OEBPS/toc.xhtml', tocHtml(options, resolvedChapters));
    }
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
