import { parse, TextNode, HTMLElement } from 'node-html-parser';

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

        const unAmpersandedHtml = content.data.replace(/&([^;]*)(\s|$)/g, '&amp;$1$2');

        let root:
            | (TextNode & {
                  valid: boolean;
              })
            | (
                  | (HTMLElement & {
                        valid: boolean;
                    })
                  | HTMLElement
              ) = parse(unAmpersandedHtml, {
            lowerCaseTagName: true,
        });

        if (root instanceof HTMLElement) {
            if (root.querySelector('body')) {
                root = root.querySelector('body');
                root.tagName = 'div';
            }

            const imageElements = root.querySelectorAll('img');

            for (const image of imageElements) {
                let url = image.getAttribute('src');
                if (url.startsWith('http') === false) {
                    continue;
                }

                if (image.hasAttribute('width') && Number(image.getAttribute('width')) < 5) {
                    const remover = image.parentNode || root;
                    // @ts-ignore it does exist
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

            const elements = root.querySelectorAll('*');
            for (const element of elements) {
                if (element.tagName === 'iframe') {
                    const remover = element.parentNode || root;
                    // @ts-ignore it does exist
                    remover.removeChild(element);
                    continue;
                }
                for (const attr in element.attributes) {
                    if (
                        allowedAttributes.has(attr) === false ||
                        (attr === 'src' && element.tagName !== 'img')
                    ) {
                        element.removeAttribute(attr);
                    }
                }
                if (options.version === 2 && allowedXhtml11Tags.has(element.tagName) === false) {
                    element.tagName = 'div';
                }
            }
        }

        const text = ('outerHTML' in root ? root.outerHTML : root.text) || '';

        return {
            title: content.title,
            filename: `${`${index}`.padStart(3, '0')}_${slug}.xhtml`,
            excludeFromToc: !!content.excludeFromToc,
            beforeToc: content.beforeToc === true,
            authors: content.authors,
            data: text.replace(/&([^;]*)(\s|$)/g, '&amp;$1$2'),
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
