async function fetchData() {
    try {
        // Express 서버에서 HTML 형식의 데이터를 가져옴
        const response = await fetch('/api/data1');
        const htmlText = await response.text();

        // HTML을 파싱하여 기사 항목을 추출
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const items = doc.querySelectorAll(".news-item");

        // 컨테이너에 결과를 렌더링
        const container = document.getElementById("container1");
        container.innerHTML = ''; // 기존 내용을 초기화

        items.forEach(item => {
            const title = item.querySelector(".news-title a").textContent;
            const content = item.querySelector(".news-content").textContent;
            const sourceLink = item.querySelector(".news-source").href;

            // 기사 아이템 생성 및 추가
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

            container.appendChild(articleElement);
        });

    } catch (error) {
        console.error('기사를 가져오는 중 오류가 발생했습니다:', error);
    }
}

// DOM이 로드될 때 기사 가져오기
document.addEventListener('DOMContentLoaded', fetchData);
