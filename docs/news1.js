async function fetchNews() {
    try {
        // Express 서버에서 JSON 형식의 뉴스 데이터를 가져옴
        const response = await fetch('/api/new1');
        const newsData = await response.json();

        // 뉴스 컨테이너에 결과를 렌더링
        const new1 = document.getElementById("new1");
        new1.innerHTML = ''; // 기존 내용을 초기화

        newsData.forEach(news => {
            // 뉴스 아이템 생성 및 추가
            const articleElement = document.createElement('div');
            articleElement.classList.add('d-flex', 'mb-3', 'hover-actions-trigger', 'align-items-center');

            articleElement.innerHTML = `
                <div class="ms-3 flex-shrink-1 flex-grow-1">
                    <h6 class="mb-1">
                        <a class="stretched-link text-900 fw-semi-bold" href="${news.sourceLink}" target="_blank">${news.title}</a>
                    </h6>
                    <div class="fs-10 mb-2">
                        ${news.content}
                    </div>
                    <a class="btn btn-tertiary border-300 btn-sm text-600" href="${news.sourceLink}" target="_blank">기사 원문보기</a>
                </div>
            `;

            new1.appendChild(articleElement);
        });

    } catch (error) {
        console.error('뉴스를 가져오는 중 오류가 발생했습니다:', error);
    }
}

// DOM이 로드될 때 뉴스 기사 가져오기
document.addEventListener('DOMContentLoaded', fetchNews);
