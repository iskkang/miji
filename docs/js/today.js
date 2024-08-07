document.addEventListener('DOMContentLoaded', () => {
    updateTodayDate();
});

function updateTodayDate() {
    const todayDateElement = document.getElementById('today-date');
    if (todayDateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);
        todayDateElement.textContent = formattedDate;
    }
}