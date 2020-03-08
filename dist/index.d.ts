/// <reference types="node" />
import JSZip from 'jszip';
import generateMapOfFiles from './generateFiles';
import { EPubOptions } from './types';
export declare const generateMapOfContents: typeof generateMapOfFiles;
export declare const createEpub: (epubConfig: EPubOptions, zipConfig: JSZip.JSZipGeneratorOptions<"string" | "blob" | "base64" | "text" | "binarystring" | "array" | "uint8array" | "arraybuffer" | "nodebuffer">) => Promise<string | Blob | ArrayBuffer | number[] | Uint8Array | Buffer>;
