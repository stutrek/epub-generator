import JSZip, { JSZipGeneratorOptions } from 'jszip';

import generateMapOfFiles from './generateFiles';
import { EPubOptions } from './types';
import loadImages from './loadImages';

export const generateMapOfContents = generateMapOfFiles;

export const createEpub = async (epubConfig: EPubOptions, zipConfig: JSZipGeneratorOptions) => {
    const files = await generateMapOfContents(epubConfig, loadImages);
    const zip = new JSZip();

    for (const [filename, contents] of files) {
        zip.file(filename, contents);
    }

    return zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 6,
        },
        ...zipConfig,
        mimeType: 'application/epub+zip',
    });
};
