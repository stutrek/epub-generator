import { EPubOptions } from './types';
declare type ImageLoader = (files: Map<string, string>) => Promise<Map<string, ArrayBuffer>>;
export default function createEpub(options: EPubOptions, loadImages: ImageLoader): Promise<Map<string, string | ArrayBuffer>>;
export {};
