async function fetchNews() {
    try {
        // 현재 날짜를 YYYYMMDD 형식으로 변환
        const today = new Date();
        const selectedDate = today.toISOString().slice(0, 10).replace(/-/g, "");

        // 지정된 URL에서 뉴스 기사를 가져옴
        const url = `https://www.forwarder.kr/logis_news/${selectedDate}`;
        const response = await fetch(url);
        const htmlText = await response.text();

        // HTML을 파싱하여 뉴스 항목을 추출
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const newsItems = doc.querySelectorAll(".news-item");

        // 뉴스 컨테이너에 결과를 렌더링
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = ''; // 기존 내용을 초기화

        newsItems.forEach(item => {
            const title = item.querySelector(".news-title a").textContent;
            const content = item.querySelector(".news-content").textContent;
            const sourceLink = item.querySelector(".news-source").href;

            // 뉴스 아이템 생성 및 추가
            const articleElement = document.createElement('div');
            articleElement.classList.add('d-flex', 'mb-3', 'hover-actions-trigger', 'align-items-center');

            articleElement.innerHTML = `
                <div class="ms-3 flex-shrink-1 flex-grow-1">
                    <h6 class="mb-1">
                        <a class="stretched-link text-900 fw-semi-bold" href="${sourceLink}" target="_blank">${title}</a>
                    </h6>
                    <div class="fs-10 mb-2">
                        ${content}
                    </div>
                    <a class="btn btn-tertiary border-300 btn-sm text-600" href="${sourceLink}" target="_blank">기사 원문보기</a>
                </div>
            `;

            newsContainer.appendChild(articleElement);
        });

    } catch (error) {
        console.error('뉴스를 가져오는 중 오류가 발생했습니다:', error);
    }
}

// DOM이 로드될 때 뉴스 기사 가져오기
document.addEventListener('DOMContentLoaded', fetchNews);
