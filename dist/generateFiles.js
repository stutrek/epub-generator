"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const diacritics_1 = require("diacritics");
const allowedAttributesAndTags_1 = require("./allowedAttributesAndTags");
const stylescss_1 = __importDefault(require("./templates/stylescss"));
const chapterhtml_1 = __importDefault(require("./templates/chapterhtml"));
const containerxml_1 = __importDefault(require("./templates/containerxml"));
const contentopf_1 = __importDefault(require("./templates/contentopf"));
const tochtml_1 = __importDefault(require("./templates/tochtml"));
const tocncx_1 = __importDefault(require("./templates/tocncx"));
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
async function createEpub(options, loadImages) {
    const images = new Map();
    let imageCount = 1;
    if (typeof options.cover === 'string') {
        const filename = options.cover.split('.').pop();
        images.set(options.cover, `cover_${filename}`);
    }
    const resolvedChapters = options.content.map(function (content, index) {
        const slug = diacritics_1.remove(content.title || 'no title').replace(/\W/g, '-');
        const document = new jsdom_1.JSDOM(content.data).window.document;
        const elements = Array.from(document.body.querySelectorAll('*'));
        for (const element of elements) {
            if (element.tagName === 'iframe' ||
                (element.hasAttribute('width') && Number(element.getAttribute('width')) < 5)) {
                element.parentNode.removeChild(element);
                continue;
            }
            if (element.tagName === 'img') {
                const image = element;
                let url = image.getAttribute('src');
                if (url.startsWith('http')) {
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
            }
            if (element.hasAttributes()) {
                var attrs = Array.from(element.attributes);
                for (var i = attrs.length - 1; i >= 0; i--) {
                    if (allowedAttributesAndTags_1.allowedAttributes.has(attrs[i].name) === false ||
                        (attrs[i].name === 'src' && element.tagName !== 'img')) {
                        element.removeAttribute(attrs[i].name);
                    }
                }
            }
            for (const attr of Array.from(element.attributes)) {
            }
            if (options.version === 2 && allowedAttributesAndTags_1.allowedXhtml11Tags.has(element.tagName) === false) {
                const newElement = document.createElement('div');
                for (const childNode of Array.from(element.childNodes)) {
                    newElement.appendChild(childNode);
                }
                element.parentNode.replaceChild(newElement, element);
            }
        }
        const text = document.body.innerHTML;
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
    const files = new Map();
    files.set('/META-INF/container.xml', containerxml_1.default);
    files.set('/OEBPS/style.css', stylescss_1.default);
    files.set('/OEBPS/content.opf', contentopf_1.default(options, resolvedChapters, images));
    files.set('/OEBPS/toc.ncx', tocncx_1.default(options, resolvedChapters));
    if (options.useToc !== false) {
        files.set('/OEBPS/toc.xhtml', tochtml_1.default(options, resolvedChapters));
    }
    resolvedChapters.forEach(chapter => {
        files.set('/OEBPS/' + chapter.filename, chapterhtml_1.default(chapter, options, getHeader(options.version, options.lang)));
    });
    const resolvedImages = await imagesPromise;
    for (const [filename, blob] of resolvedImages) {
        files.set(`/OEBPS/images/${filename}`, blob);
    }
    return files;
}
exports.default = createEpub;
//# sourceMappingURL=generateFiles.js.map