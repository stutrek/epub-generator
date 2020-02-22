var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "node-html-parser", "entities", "diacritics", "./loadImages", "./allowedAttributesAndTags", "./templates/stylescss", "./templates/chapterhtml", "./templates/containerxml", "./templates/contentopf", "./templates/tochtml", "./templates/tocncx"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const node_html_parser_1 = require("node-html-parser");
    const entities_1 = require("entities");
    const diacritics_1 = require("diacritics");
    const loadImages_1 = __importDefault(require("./loadImages"));
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
    const createChapterHtml = (htmlFragment, chapter, options) => {
        const injectTitle = options.title && options.injectChapterTitles;
        const injectAuthor = injectTitle && chapter.authors.length;
        const injectLink = injectTitle && chapter.url;
        return `${getHeader(options.version || 3, options.lang)}
		<head>
		<meta charset="UTF-8" />
		<title>${entities_1.encodeXML(options.title || '')}</title>
			<link rel="stylesheet" type="text/css" href="style.css" />
		</head>
		<body>
			${injectTitle ? `<h1>${entities_1.encodeXML(chapter.title)}</h1>` : ''}
			${injectAuthor ? `<div class="epub-author">${entities_1.encodeXML(chapter.authors.join(', '))}</div>` : ''}
			${injectLink ? `<div class="epub-link"><a href="${chapter.url}">View on}</a></div>` : ''}
			${htmlFragment}
		</body>
		</html>
		`;
    };
    function createEpub(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const images = new Map();
            let imageCount = 1;
            if (typeof options.cover === 'string') {
                const filename = options.cover.split('.').pop();
                images.set(options.cover, `cover_${filename}`);
            }
            const resolvedChapters = options.content.map(function (content, index) {
                const slug = diacritics_1.remove(content.title || 'no title').replace(/\W/g, '-');
                let root = node_html_parser_1.parse(content.data, {
                    lowerCaseTagName: true,
                });
                if (root instanceof node_html_parser_1.HTMLElement) {
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
                            if (allowedAttributesAndTags_1.allowedAttributes.has(attr) === false) {
                                element.removeAttribute(attr);
                            }
                        }
                        if (options.version === 2 && allowedAttributesAndTags_1.allowedXhtml11Tags.has(element.tagName) === false) {
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
            const imagesPromise = loadImages_1.default(images);
            const files = new Map();
            files.set('/META-INF/container.xml', containerxml_1.default);
            files.set('/OEBPS/style.css', stylescss_1.default);
            files.set('/OEBPS/content.opf', contentopf_1.default(options, resolvedChapters, images));
            files.set('/OEBPS/toc.ncx', tocncx_1.default(options, resolvedChapters));
            files.set('/OEBPS/toc.xhtml', tochtml_1.default(options, resolvedChapters));
            resolvedChapters.forEach(chapter => {
                files.set('/OEBPS/' + chapter.filename, chapterhtml_1.default(chapter, options, getHeader(options.version, options.lang)));
            });
            const resolvedImages = yield imagesPromise;
            for (const [filename, blob] of resolvedImages) {
                files.set(`/OEBPS/images/${filename}`, blob);
            }
            return files;
        });
    }
    exports.default = createEpub;
});
//# sourceMappingURL=generateMapOfFiles.js.map