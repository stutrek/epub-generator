/// <reference types="node" />
import JSZip from 'jszip';
import generateMapOfFiles from './generateMapOfFiles';
import { EPubOptions } from './types';
export declare const generateMapOfContents: typeof generateMapOfFiles;
export declare const createEpub: (epubConfig: EPubOptions, zipConfig: JSZip.JSZipGeneratorOptions<"string" | "text" | "arraybuffer" | "blob" | "base64" | "binarystring" | "array" | "uint8array" | "nodebuffer">) => Promise<string | number[] | ArrayBuffer | Uint8Array | Blob | Buffer>;
