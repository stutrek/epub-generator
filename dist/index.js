"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jszip_1 = __importDefault(require("jszip"));
const generateFiles_1 = __importDefault(require("./generateFiles"));
const loadImages_1 = __importDefault(require("./loadImages"));
exports.generateMapOfContents = generateFiles_1.default;
exports.createEpub = async (epubConfig, zipConfig) => {
    const files = await exports.generateMapOfContents(epubConfig, loadImages_1.default);
    const zip = new jszip_1.default();
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
//# sourceMappingURL=index.js.map