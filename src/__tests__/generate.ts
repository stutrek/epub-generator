import fetch from 'node-fetch';
// @ts-ignore
global.fetch = fetch;
import { parse } from 'react-native-rss-parser';
import { writeFileSync } from 'fs';

import { createEpub } from '../index';
import testFeed from './testFeed';

const feedUrls = ['https://theconversation.com/us/technology/articles.atom'];

export async function generateEpubs() {
    // const feeds = await Promise.all(
    //     feedUrls.map(async feedUrl => {
    //         const res = await fetch(feedUrl);
    //         const text = await res.text();
    //         // console.log(text);
    //         return parse(text);
    //     })
    // );
    // console.log('loaded');

    const feeds = await Promise.all([parse(testFeed)]);

    const promises: Promise<any>[] = [];
    for (const feed of feeds) {
        if (feed.items === undefined) {
            continue;
        }

        for (const article of feed.items) {
            const config = {
                title: article.title,
                authors: article.authors.map(author => author.name),
                publisher: feed.title,
                lang: feed.language,
                useToc: false,
                uuid: article.id,
                injectChapterTitles: true,
                description: article.description,
                date: article.published,
                copyright: feed.copyright,
                content: [
                    {
                        title: article.title,
                        authors: article.authors.map(author => author.name),
                        data: article.content,
                        beforeToc: true,
                        url: article.links[0].url,
                    },
                ],
            };

            const book = await createEpub(config, {
                type: 'nodebuffer',
            });
            const filePath = `${__dirname}/generatedFiles/${article.id
                ?.replace(/\W/g, '_')
                .replace(/^https?_+/, '')}.epub`;
            writeFileSync(filePath, book);
        }
    }
    await Promise.all(promises);
}

generateEpubs();
