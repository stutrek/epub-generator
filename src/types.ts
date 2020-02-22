export interface ChapterInput {
  title: string;
  data: string;
  url?: string;
  authors: string[];
  excludeFromToc?: boolean;
  beforeToc?: boolean;
}

export interface ResolvedChapter {
  title: string;
  data: string;
  url?: string;
  authors: string[];
  filename: string;
  excludeFromToc: boolean;
  beforeToc: boolean;
}

export interface EPubOptions {
  uuid: string;
  title: string;
  authors: string[];
  publisher: string;
  copyright: string;
  cover?: string | Blob;
  version?: 2 | 3;
  css?: string;
  lang: string;
  useToc: boolean;
  tocTitle?: string;
  description: string;
  injectChapterTitles: boolean;
  date: string;
  content: ChapterInput[];
}
