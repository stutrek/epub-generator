import notFoundImage from './templates/notfound-minpng';

let notFoundPromise: Promise<ArrayBuffer>;

const getNotFound = () => {
    if (notFoundPromise === undefined) {
        notFoundPromise = fetch(notFoundImage).then(res => res.arrayBuffer());
    }
    return notFoundPromise;
};

export default function loadImages(imageMap: Map<string, string>) {
    const promises = [];
    const returns = new Map<string, ArrayBuffer>();
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
