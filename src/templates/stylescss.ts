export default /*css*/ `
    html, body {
        margin: 0;
        padding: 0;
        line-height: 1.5;
    }

    h1, h2, h3, h4, h5, h6 {
        line-height: 1.2;
        font-weight: normal;
    }
    
    p, ul, ol {
		margin: 1em 0 0 0;
        hyphens: auto;
    }
    p + p {
        text-indent: 1em;
        margin: 0;
	}
	img {
		margin: 1em auto 0;
        display: block;
        width: 100%;
	}

    .gallery, figure, .caption, .attribution {
        padding: 0;
        display: block;
        list-style-type: none;
        font-size: 85%;
        line-height: 1.3;
    }
    .gallery > * {
        display: block;
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
	a:link {
		text-decoration: none;
    }
`;
