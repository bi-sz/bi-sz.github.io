(function () {
    "use strict";

    function isStandaloneMode() {
        return (
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true
        );
    }

    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function setupInstallBanner() {
        const banner = document.getElementById("install-banner");
        const textEl = document.getElementById("install-banner-text");
        const installBtn = document.getElementById("install-banner-install");
        const closeBtn = document.getElementById("install-banner-close");
        const storageKey = "aeons-install-dismissed";
        let deferredPrompt = null;

        if (!banner || isStandaloneMode() || !isMobileDevice()) {
            return;
        }

        if (localStorage.getItem(storageKey) === "1") {
            return;
        }

        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isIOS) {
            textEl.textContent =
                "Safari 공유(↑) → 「홈 화면에 추가」로 실행하면 주소창 없이 앱처럼 쓸 수 있어요.";
        } else {
            textEl.textContent =
                "「앱으로 설치」 또는 브라우저 메뉴 → 홈 화면에 추가로 설치할 수 있어요.";
        }

        window.addEventListener("beforeinstallprompt", function (event) {
            event.preventDefault();
            deferredPrompt = event;
            installBtn.hidden = false;
        });

        installBtn.addEventListener("click", function () {
            if (!deferredPrompt) {
                return;
            }
            deferredPrompt.prompt();
            deferredPrompt.userChoice.finally(function () {
                deferredPrompt = null;
                banner.hidden = true;
            });
        });

        closeBtn.addEventListener("click", function () {
            localStorage.setItem(storageKey, "1");
            banner.hidden = true;
        });

        banner.hidden = false;
    }

    setupInstallBanner();
})();
