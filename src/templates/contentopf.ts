import { EPubOptions, ResolvedChapter } from '../types';
import { encodeXML } from 'entities';

const imageMime = (filename: string) => {
    const ending = filename.split('.').pop();
    return `image/${ending}`;
};

export default function contentOpfTemplate(
    options: EPubOptions,
    chapters: ResolvedChapter[],
    images: Map<string, string>
) {
    return /* html */ `<?xml version="1.0" encoding="UTF-8"?>
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

        <dc:identifier id="BookId">${encodeXML(options.uuid)}</dc:identifier>
        <meta refines="#BookId" property="identifier-type" scheme="onix:codelist5">22</meta>
        <meta property="dcterms:identifier" id="meta-identifier">BookId</meta>
        <dc:title>${encodeXML(options.title)}</dc:title>
        <meta property="dcterms:title" id="meta-title">${encodeXML(options.title)}</meta>
        <dc:language>${encodeXML(options.lang)}</dc:language>
        <meta property="dcterms:language" id="meta-language">${encodeXML(options.lang)}</meta>
		<meta property="dcterms:modified">${encodeXML(options.date)}</meta>
		${
            options.authors.length
                ? `
		<dc:creator id="creator">${encodeXML(options.authors.join(', '))}</dc:creator>
        <meta refines="#creator" property="file-as">${encodeXML(options.authors.join(', '))}</meta>`
                : ''
        }
        ${
            encodeXML(options.publisher)
                ? `
		<meta property="dcterms:publisher">${encodeXML(options.publisher)}</meta>
        <dc:publisher>${encodeXML(options.publisher)}</dc:publisher>`
                : ''
        }
        
        <meta property="dcterms:date">${encodeXML(options.date)}</meta>
        <dc:date>${encodeXML(options.date)}</dc:date>
        <meta property="dcterms:rights">All rights reserved</meta>
        <dc:rights>${encodeXML(options.copyright)}</dc:rights>
        <meta name="cover" content="image_cover"/>
        <meta name="generator" content="epub-gen" />

    </metadata>

    <manifest>
        <item id="ncx" href="./toc.ncx" media-type="application/x-dtbncx+xml" />
        <item id="toc" href="./toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
		<item id="css" href="./style.css" media-type="text/css" />
		${Array.from(images.values()).map(
            filename =>
                `<item href="./images/${filename}" id="${filename.replace(
                    /\W/g,
                    '_'
                )}" media-type="${imageMime(filename)}" />`
        )}
		${chapters.map(
            (chapter, index) =>
                `<item id="content_${index}" href="./${chapter.filename}" media-type="application/xhtml+xml" />`
        )}
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
