const DEADLINE = new Date('2025-12-30T23:59:00+08:00').getTime();

let intervalId = null;
let observer = null;

function updateCountdown() {
    const timerEl = document.getElementById('countdown-timer');
    if (!timerEl) return;

    const now = Date.now();
    const diff = DEADLINE - now;

    if (diff <= 0) {
        timerEl.textContent = '（已截止）';
        timerEl.style.color = '#d32f2f';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timerEl.textContent = `（剩余 ${days}天 ${hours}时 ${minutes}分 ${seconds}秒）`;
    timerEl.style.color = days < 1 ? '#d32f2f' : '#1976d2';
}

function startCountdown() {
    if (!intervalId) {
        updateCountdown();
        intervalId = setInterval(updateCountdown, 1000);
    }
}

function stopCountdown() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

export function onRouteDidUpdate() {
    // 清理之前的 observer 和定时器
    if (observer) {
        observer.disconnect();
    }
    stopCountdown();

    const announcementBar = document.querySelector('[class*="announcementBar"]');
    if (!announcementBar) return;

    // 使用 IntersectionObserver 检测公告栏可见性
    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startCountdown();
                } else {
                    stopCountdown();
                }
            });
        },
        { threshold: 0 }
    );

    observer.observe(announcementBar);
}
