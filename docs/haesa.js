async function fetchHaesaNews() {
    try {
        const targetUrl = 'https://www.haesainfo.com/news/articleList.html?sc_section_code=S1N12&view_type=sm';

        // Fetch the HTML content from the target URL
        const response = await axios.get(targetUrl);

        if (!response || response.status !== 200) {
            throw new Error(`HTTP error! status: ${response ? response.status : 'No Response'}`);
        }

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract the top 5 news articles
        const articles = [];
        $('#section-list ul.type1 li').each((index, element) => {
            const titleElement = $(element).find('h4.titles a');
            const title = titleElement.text().trim();
            const link = 'https://www.haesainfo.com' + titleElement.attr('href');
            const dateElement = $(element).find('em.info.dated');
            const date = dateElement.text().trim();
            articles.push({ title, url: link, date });
            if (articles.length >= 5) return false; // Limit to 5 articles
        });

        return articles;

    } catch (error) {
        console.error('Failed to fetch HAESA news articles:', error);
        return [];
    }
}

// Export the function for use in other files
module.exports = { fetchHaesaNews };
