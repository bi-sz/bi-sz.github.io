(function () {
    "use strict";

    const DECK_SIZE = 6;

    const DECK_TEMPLATE = [
        { type: "nemesis" },
        { type: "nemesis" },
        { type: "ry" },
        { type: "ry" },
        { type: "gb" },
        { type: "gb" },
    ];

    const CARD_IMAGE_SRC = {
        back: "image/aeons/cover.png",
        ry: "image/aeons/red&yellow.png",
        gb: "image/aeons/green&blue.png",
        nemesis: "image/aeons/neme2.jpg",
    };

    function preloadCardImages() {
        Object.keys(CARD_IMAGE_SRC).forEach(function (key) {
            const img = new Image();
            img.decoding = "async";
            img.src = CARD_IMAGE_SRC[key];
        });
    }

    function shuffle(array) {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    function createFreshDeck() {
        return shuffle(DECK_TEMPLATE);
    }

    function createCardElement(faceType, options) {
        const opts = options || {};
        const wrap = document.createElement("div");
        wrap.className = "card-wrap";

        const card = document.createElement("div");
        card.className = "card card--" + faceType;
        card.setAttribute("role", "img");

        const img = document.createElement("img");
        img.className = "card__img";
        img.alt = "";
        img.decoding = "async";
        img.src = CARD_IMAGE_SRC[faceType];
        card.appendChild(img);

        if (faceType === "back") {
            card.setAttribute("aria-label", "차례 순서 카드 뒷면");
        } else if (faceType === "nemesis") {
            card.setAttribute("aria-label", "네메시스");
        } else if (faceType === "ry") {
            card.setAttribute("aria-label", "플레이어 턴 (빨강 또는 노랑)");
            if (!opts.compact) {
                const hint = document.createElement("div");
                hint.className = "card__hint";
                hint.textContent = "빨강 / 노랑";
                card.appendChild(hint);
            }
        } else if (faceType === "gb") {
            card.setAttribute("aria-label", "플레이어 턴 (초록 또는 파랑)");
            if (!opts.compact) {
                const hint = document.createElement("div");
                hint.className = "card__hint";
                hint.textContent = "초록 / 파랑";
                card.appendChild(hint);
            }
        }

        wrap.appendChild(card);
        return { wrap, card };
    }

    function mountDeckBack(pileEl) {
        pileEl.innerHTML = "";
        ["stack-1", "stack-2", "stack-top"].forEach(function (cls) {
            const { card } = createCardElement("back");
            card.classList.add(cls);
            pileEl.appendChild(card);
        });
    }

    const state = {
        deck: [],
        revealed: [],
        isDrawing: false,
    };

    const pileEl = document.getElementById("deck-pile");
    const remainingEl = document.getElementById("remaining-count");
    const hintEl = document.getElementById("draw-hint");
    const initBtn = document.getElementById("btn-init");
    const currentCardEl = document.getElementById("current-card");
    const revealedGrid = document.getElementById("revealed-grid");
    const historyBar = document.getElementById("history-bar");
    const historyStrip = document.getElementById("history-strip");
    const revealedPanel = document.querySelector(".revealed-panel");

    function ensureDeckHasCards() {
        if (state.deck.length === 0) {
            state.deck = createFreshDeck();
        }
    }

    function updateRevealedState() {
        const hasCards = state.revealed.length > 0;
        revealedPanel.classList.toggle("has-cards", hasCards);
        historyBar.classList.toggle("has-cards", hasCards);
        currentCardEl.classList.toggle("is-clickable", hasCards);
    }

    function renderCurrentCard(face) {
        currentCardEl.innerHTML = "";
        if (!face) {
            return;
        }
        const { wrap } = createCardElement(face.type);
        currentCardEl.appendChild(wrap);
    }

    function renderCurrentFromState() {
        const last = state.revealed[state.revealed.length - 1];
        renderCurrentCard(last || null);
    }

    /** 세로 그리드: 현재 덱 사이클(최대 6장)만 표시 */
    function getCurrentCycleRevealed() {
        if (state.revealed.length === 0) {
            return [];
        }
        const countInCycle = state.revealed.length % DECK_SIZE || DECK_SIZE;
        return state.revealed.slice(-countInCycle);
    }

    function appendRevealedGridCard(face, animate) {
        const { wrap } = createCardElement(face.type);
        if (animate) {
            wrap.classList.add("pop-in");
        }
        revealedGrid.appendChild(wrap);
    }

    function renderRevealedGrid(animateLast) {
        const cycleCards = getCurrentCycleRevealed();
        if (cycleCards.length === 0) {
            revealedGrid.innerHTML = "";
            return;
        }

        if (animateLast && cycleCards.length === 1) {
            revealedGrid.innerHTML = "";
            appendRevealedGridCard(cycleCards[0], true);
            return;
        }

        if (animateLast && cycleCards.length > 1) {
            const domCount = revealedGrid.childElementCount;
            if (domCount === cycleCards.length - 1) {
                appendRevealedGridCard(cycleCards[cycleCards.length - 1], true);
                return;
            }
        }

        revealedGrid.innerHTML = "";
        cycleCards.forEach(function (face) {
            appendRevealedGridCard(face, false);
        });
    }

    function appendHistoryDivider() {
        const divider = document.createElement("div");
        divider.className = "history-divider";
        divider.setAttribute("aria-hidden", "true");
        historyStrip.appendChild(divider);
    }

    function appendHistoryCard(face) {
        const { wrap } = createCardElement(face.type, { compact: true });
        historyStrip.appendChild(wrap);
        requestAnimationFrame(function () {
            historyStrip.scrollLeft = historyStrip.scrollWidth;
        });
    }

    function removeLastHistoryEntry() {
        const last = historyStrip.lastElementChild;
        if (last && last.classList.contains("card-wrap")) {
            historyStrip.removeChild(last);
        }
        const prev = historyStrip.lastElementChild;
        if (prev && prev.classList.contains("history-divider")) {
            historyStrip.removeChild(prev);
        }
    }

    function updateUI() {
        remainingEl.textContent = String(state.deck.length);
        pileEl.disabled = state.isDrawing;
        hintEl.textContent = "탭하여 뽑기";
        updateRevealedState();
    }

    function fullReset() {
        state.deck = createFreshDeck();
        state.revealed = [];
        state.isDrawing = false;
        currentCardEl.innerHTML = "";
        revealedGrid.innerHTML = "";
        historyStrip.innerHTML = "";
        mountDeckBack(pileEl);
        updateUI();
    }

    function rollbackLastDraw() {
        if (state.isDrawing || state.revealed.length === 0) {
            return;
        }

        const entry = state.revealed.pop();
        state.deck = entry.deckSnapshot;

        removeLastHistoryEntry();
        renderRevealedGrid(false);

        renderCurrentFromState();
        updateUI();
    }

    function drawCard() {
        if (state.isDrawing) {
            return;
        }

        ensureDeckHasCards();

        const deckSnapshot = state.deck.map(function (card) {
            return { type: card.type };
        });

        state.isDrawing = true;
        pileEl.disabled = true;
        pileEl.classList.add("drawing");
        const face = state.deck.shift();

        setTimeout(function () {
            pileEl.classList.remove("drawing");
            state.isDrawing = false;

            if (state.revealed.length > 0 && state.revealed.length % DECK_SIZE === 0) {
                appendHistoryDivider();
            }

            state.revealed.push({
                type: face.type,
                deckSnapshot: deckSnapshot,
            });

            renderCurrentCard(face);
            renderRevealedGrid(true);

            appendHistoryCard(face);

            ensureDeckHasCards();
            updateUI();
        }, 380);
    }

    pileEl.addEventListener("click", drawCard);
    currentCardEl.addEventListener("click", rollbackLastDraw);
    revealedGrid.addEventListener("click", function (event) {
        const wrap = event.target.closest(".card-wrap");
        if (!wrap || wrap !== revealedGrid.lastElementChild) {
            return;
        }
        rollbackLastDraw();
    });
    initBtn.addEventListener("click", fullReset);

    setupInstallBanner();
    preloadCardImages();
    fullReset();

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
        const storageKey = "aeons-turn-install-dismissed";
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
                "Safari 공유 버튼(↑) → 「홈 화면에 추가」로 실행하면 주소창 없이 전체 화면으로 쓸 수 있어요.";
        } else {
            textEl.textContent =
                "「앱으로 설치」 또는 브라우저 메뉴 → 홈 화면에 추가하면 주소창 없이 실행됩니다.";
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
})();
