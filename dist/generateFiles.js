"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize_html_1 = __importDefault(require("sanitize-html"));
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
        const sanitizeConfig = {
            allowedAttributes: {
                '*': allowedAttributesAndTags_1.allowedAttributes,
                img: ['src', ...allowedAttributesAndTags_1.allowedAttributes],
            },
            allowedTags: allowedAttributesAndTags_1.allowedXhtml11Tags,
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
        const cleanHtml = sanitize_html_1.default(`<div>${content.data.trim()}</div>`, sanitizeConfig);
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