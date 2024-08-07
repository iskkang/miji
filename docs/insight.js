document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.media-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const source = button.getAttribute('data-source');
            loadMedia(source);
        });
    });

    // Automatically load the first media source on page load
    const firstSource = buttons[0].getAttribute('data-source');
    loadMedia(firstSource);
});

async function loadMedia(source) {
    try {
        const response = await fetch(`/media/${source}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        if (response.ok) {
            const data = await response.json();
            displayMedia(data.articles.slice(0, 5)); // Display only the first 5 articles
        } else {
            console.error('Failed to fetch media:', response.status);
        }
    } catch (error) {
        console.error('Error fetching media:', error);
    }
}

function displayMedia(articles) {
    const mediaTableBody = document.getElementById('mediaTableBody');
    mediaTableBody.innerHTML = ''; // Clear previous media

    articles.forEach(article => {
        const row = document.createElement('tr');
        const fixedLink = fixLink(article.url); // Fix the link if necessary
        row.innerHTML = `
            <td><a href="${fixedLink}" target="_blank">${article.title}</a></td>
        `;
        mediaTableBody.appendChild(row);
    });
}

function fixLink(url) {
    let fixedUrl = url;
    
    if (url.startsWith('https//')) {
        fixedUrl = url.replace('https//', 'https://');
    }
    
    if (url.startsWith('https://seanews.ruhttps//')) {
        fixedUrl = url.replace('https://seanews.ruhttps//', 'https://seanews.ru/');
    }

    if (url.startsWith('https://seanews.ruhttps://')) {
        fixedUrl = url.replace('https://seanews.ruhttps://', 'https://seanews.ru/');
    }

    return fixedUrl;
}
