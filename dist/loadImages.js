"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_minpng_1 = __importDefault(require("./templates/notfound-minpng"));
let notFoundPromise;
const getNotFound = () => {
    if (notFoundPromise === undefined) {
        notFoundPromise = fetch(notfound_minpng_1.default).then(res => res.arrayBuffer());
    }
    return notFoundPromise;
};
function loadImages(imageMap) {
    const promises = [];
    const returns = new Map();
    for (const [url, name] of imageMap) {
        const promise = fetch(url)
            .then(res => res.arrayBuffer())
            .catch(getNotFound)
            .then(buffer => {
            returns.set(name, buffer);
        });
        promises.push(promise);
    }
    return Promise.all(promises).then(() => returns);
}
exports.default = loadImages;
//# sourceMappingURL=loadImages.js.map