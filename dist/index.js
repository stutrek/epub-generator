"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const jszip_1 = __importDefault(require("jszip"));
const generateMapOfFiles_1 = __importDefault(require("./generateMapOfFiles"));
exports.generateMapOfContents = generateMapOfFiles_1.default;
exports.createEpub = (epubConfig, zipConfig) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield exports.generateMapOfContents(epubConfig);
    const zip = new jszip_1.default();
    for (const [filename, contents] of files) {
        zip.file(filename, contents);
    }
    return zip.generateAsync(Object.assign(Object.assign({ type: 'blob', compression: 'DEFLATE', compressionOptions: {
            level: 6,
        } }, zipConfig), { mimeType: 'application/epub+zip' }));
});
//# sourceMappingURL=index.js.map