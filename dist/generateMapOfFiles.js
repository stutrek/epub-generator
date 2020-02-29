var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parse, HTMLElement } from 'node-html-parser';
import { remove as removeDiacritics } from 'diacritics';
import { allowedAttributes, allowedXhtml11Tags } from './allowedAttributesAndTags';
import styleSheet from './templates/stylescss';
import chapterHtml from './templates/chapterhtml';
import containerXml from './templates/containerxml';
import contentOpf from './templates/contentopf';
import tocHtml from './templates/tochtml';
import tocNcx from './templates/tocncx';
const getHeader = (version, lang) => {
    if (version === 2) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">\
`;
    }
    else {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}">\
`;
    }
};
export default function createEpub(options, loadImages) {
    return __awaiter(this, void 0, void 0, function* () {
        const images = new Map();
        let imageCount = 1;
        if (typeof options.cover === 'string') {
            const filename = options.cover.split('.').pop();
            images.set(options.cover, `cover_${filename}`);
        }
        const resolvedChapters = options.content.map(function (content, index) {
            const slug = removeDiacritics(content.title || 'no title').replace(/\W/g, '-');
            const unAmpersandedHtml = content.data.replace(/&([^;]*)(\s|$)/g, '&amp;$1$2');
            let root = parse(unAmpersandedHtml, {
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
                filename: `${`${index}`.padStart(3, '0')}_${slug}.xhtml`,
                excludeFromToc: !!content.excludeFromToc,
                beforeToc: content.beforeToc === true,
                authors: content.authors,
                data: 'outerHTML' in root ? root.outerHTML : root.text,
                url: content.url,
            };
        });
        const imagesPromise = loadImages(images);
        const files = new Map();
        files.set('/META-INF/container.xml', containerXml);
        files.set('/OEBPS/style.css', styleSheet);
        files.set('/OEBPS/content.opf', contentOpf(options, resolvedChapters, images));
        files.set('/OEBPS/toc.ncx', tocNcx(options, resolvedChapters));
        files.set('/OEBPS/toc.xhtml', tocHtml(options, resolvedChapters));
        resolvedChapters.forEach(chapter => {
            files.set('/OEBPS/' + chapter.filename, chapterHtml(chapter, options, getHeader(options.version, options.lang)));
        });
        const resolvedImages = yield imagesPromise;
        for (const [filename, blob] of resolvedImages) {
            files.set(`/OEBPS/images/${filename}`, blob);
        }
        return files;
    });
}
//# sourceMappingURL=generateMapOfFiles.js.map