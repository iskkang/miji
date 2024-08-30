async function fetchNews() {
    try {
        const response = await fetch('http://localhost:3000/logis-news');
        const newsList = await response.json();

        const newsContainer = document.getElementById('news-container');

        newsList.forEach(news => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';

            const newsTitle = document.createElement('h3');
            newsTitle.className = 'news-title';
            const titleLink = document.createElement('a');
            titleLink.href = news.link;
            titleLink.target = '_blank';
            titleLink.textContent = news.title;
            newsTitle.appendChild(titleLink);

            const newsContent = document.createElement('p');
            newsContent.className = 'news-content';
            newsContent.textContent = news.content;

            const newsSource = document.createElement('p');
            newsSource.className = 'news-source';
            const sourceLink = document.createElement('a');
            sourceLink.href = news.source;
            sourceLink.target = '_blank';
            sourceLink.textContent = '기사 원문보기';
            newsSource.appendChild(sourceLink);

            newsItem.appendChild(newsTitle);
            newsItem.appendChild(newsContent);
            newsItem.appendChild(newsSource);

            newsContainer.appendChild(newsItem);
        });
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// Fetch news when the page loads
window.onload = fetchNews;
