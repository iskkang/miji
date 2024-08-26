async function fetchNewsArticles() {
    try {
        const targetUrl = 'https://port-0-miji-lysc4ja0acad2542.sel4.cloudtype.app/heasa-news';  // Calls the /heasa-news endpoint on your server

        // Fetch the news data from the server
        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Return the top 5 news articles
        return data.articles;

    } catch (error) {
        console.error('Failed to fetch news articles:', error);
        return [];
    }
}

function renderNewsArticles(newsData) {
    const newsContainer = document.querySelector('#news-articles');

    newsContainer.innerHTML = ''; // Clear any previous content

    newsData.forEach(news => {
        const articleElement = document.createElement('div');
        articleElement.className = 'row g-0 align-items-center py-2 position-relative border-bottom border-200';

        articleElement.innerHTML = `
            <div class="col ps-x1 py-1 position-static">
                <div class="d-flex align-items-center">
                    <div class="flex-1">
                        <h6 class="mb-0 d-flex align-items-center">
                            <a class="text-800 stretched-link" href="${news.link}" target="_blank">${news.title}</a>
                        </h6>
                        <p class="text-500 fs-11 mb-0">${news.date}</p>
                    </div>
                </div>
            </div>
        `;

        newsContainer.appendChild(articleElement);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const newsData = await fetchNewsArticles();
    if (newsData.length > 0) {
        renderNewsArticles(newsData);
    }
});
