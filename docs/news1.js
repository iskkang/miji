        async function fetchNews(page) {
            try {
                const response = await fetch(`https://localhost:3000/logis-news/${page}`);
                const newsList = await response.json();

                const newsContainer = document.getElementById('news-container');
                newsContainer.innerHTML = ''; // 기존 뉴스 항목 초기화

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
                    newsSource.textContent = `출처 : ${news.source}`;

                    newsItem.appendChild(newsTitle);
                    newsItem.appendChild(newsContent);
                    newsItem.appendChild(newsSource);

                    newsContainer.appendChild(newsItem);
                });
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        }

        // 초기 로딩 시 1페이지 뉴스 가져오기
        window.onload = () => fetchNews(1);
