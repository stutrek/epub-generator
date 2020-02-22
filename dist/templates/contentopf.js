(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const imageMime = (filename) => {
        const ending = filename.split('.').pop();
        return `image/${ending}`;
    };
    function contentOpfTemplate(options, chapters, images) {
        return `<?xml version="1.0" encoding="UTF-8"?>
	<package xmlns="http://www.idpf.org/2007/opf"
         version="3.0"
         unique-identifier="BookId"
         xmlns:dc="http://purl.org/dc/elements/1.1/"
         xmlns:dcterms="http://purl.org/dc/terms/"
         xml:lang="en"
         xmlns:media="http://www.idpf.org/epub/vocab/overlays/#"
         prefix="ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/">

    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"
              xmlns:opf="http://www.idpf.org/2007/opf">

        <dc:identifier id="BookId">${options.uuid}</dc:identifier>
        <meta refines="#BookId" property="identifier-type" scheme="onix:codelist5">22</meta>
        <meta property="dcterms:identifier" id="meta-identifier">BookId</meta>
        <dc:title>${options.title}</dc:title>
        <meta property="dcterms:title" id="meta-title">${options.title}</meta>
        <dc:language>${options.lang}</dc:language>
        <meta property="dcterms:language" id="meta-language">${options.lang}</meta>
		<meta property="dcterms:modified">${options.date}</meta>
		${options.authors.length
            ? `
		<dc:creator id="creator">${options.authors.join(', ')}</dc:creator>
        <meta refines="#creator" property="file-as">${options.authors.join(', ')}</meta>`
            : ''}
        ${options.publisher
            ? `
		<meta property="dcterms:publisher">${options.publisher}</meta>
        <dc:publisher>${options.publisher}</dc:publisher>`
            : ''}
        
        <meta property="dcterms:date">${options.date}</meta>
        <dc:date>${options.date}</dc:date>
        <meta property="dcterms:rights">All rights reserved</meta>
        <dc:rights>${options.copyright}</dc:rights>
        <meta name="cover" content="image_cover"/>
        <meta name="generator" content="epub-gen" />

    </metadata>

    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
        <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
		<item id="css" href="style.css" media-type="text/css" />
		${Array.from(images.values()).map(filename => `<item href="./images/${filename}" id="${filename.replace(/\W/g, '_')}" media-type="${imageMime(filename)}" />`)}
		${chapters.map((chapter, index) => `<item id="content_${index}" href="./${chapter.filename}" media-type="application/xhtml+xml" />`)}
    </manifest>

	<spine toc="ncx">
		${chapters.map((chapter, index) => {
            if (chapter.beforeToc) {
                return `<itemref idref="content_${index}"/>`;
            }
        })}
        <itemref idref="toc" />
		${chapters.map((chapter, index) => {
            if (chapter.beforeToc === false) {
                return `<itemref idref="content_${index}"/>`;
            }
        })}
    </spine>
    <guide>
        <reference type="text" title="Table of Content" href="toc.xhtml"/>
    </guide>
</package>`;
    }
    exports.default = contentOpfTemplate;
});
//# sourceMappingURL=contentopf.js.map