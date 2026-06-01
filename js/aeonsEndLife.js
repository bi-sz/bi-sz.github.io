(function () {
    "use strict";

    const STORAGE_KEY = "aeons-life-hp";
    const MAX_HP = 99;

    const TRACKER_META = {
        grave: { label: "그레이브홀드" },
        neme: { label: "네메시스" },
    };

    const state = {
        active: "grave",
        grave: 0,
        neme: 0,
    };

    const cards = document.querySelectorAll(".life-card");
    const activeLabel = document.getElementById("active-label");
    const slider = document.getElementById("hp-slider");
    const btnMinus = document.getElementById("btn-minus");
    const btnPlus = document.getElementById("btn-plus");

    let saveTimer = null;

    function clamp(value) {
        return Math.max(0, Math.min(MAX_HP, value));
    }

    function splitDigits(value) {
        const safe = clamp(value);
        return {
            tens: Math.floor(safe / 10),
            ones: safe % 10,
        };
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return;
            }
            const data = JSON.parse(raw);
            if (typeof data.grave === "number") {
                state.grave = clamp(data.grave);
            }
            if (typeof data.neme === "number") {
                state.neme = clamp(data.neme);
            }
            if (data.active === "grave" || data.active === "neme") {
                state.active = data.active;
            }
        } catch (err) {
            /* ignore */
        }
    }

    function saveState() {
        if (saveTimer) {
            clearTimeout(saveTimer);
        }
        saveTimer = setTimeout(function () {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    grave: state.grave,
                    neme: state.neme,
                    active: state.active,
                })
            );
        }, 200);
    }

    function renderTrackerDigits(target) {
        const digits = splitDigits(state[target]);
        document.querySelectorAll('.hp-digit[data-target="' + target + '"]').forEach(function (el) {
            el.textContent = String(digits[el.getAttribute("data-place")]);
        });
    }

    function renderAll() {
        renderTrackerDigits("grave");
        renderTrackerDigits("neme");

        cards.forEach(function (card) {
            const isActive = card.getAttribute("data-target") === state.active;
            card.classList.toggle("is-active", isActive);
            card.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        activeLabel.textContent = TRACKER_META[state.active].label;
        slider.value = String(state[state.active]);
    }

    function setActive(target) {
        if (target !== "grave" && target !== "neme") {
            return;
        }
        state.active = target;
        renderAll();
        saveState();
    }

    function setHp(value) {
        state[state.active] = clamp(value);
        renderAll();
        saveState();
    }

    function adjustHp(delta) {
        setHp(state[state.active] + delta);
    }

    function cycleDigit(target, place) {
        const digits = splitDigits(state[target]);
        if (place === "tens") {
            digits.tens = (digits.tens + 1) % 10;
        } else {
            digits.ones = (digits.ones + 1) % 10;
        }
        state[target] = clamp(digits.tens * 10 + digits.ones);
        renderAll();
        saveState();
    }

    cards.forEach(function (card) {
        card.addEventListener("click", function () {
            setActive(card.getAttribute("data-target"));
        });
    });

    document.querySelectorAll(".hp-digit").forEach(function (digit) {
        digit.addEventListener("click", function (event) {
            event.stopPropagation();
            const target = digit.getAttribute("data-target");
            setActive(target);
            cycleDigit(target, digit.getAttribute("data-place"));
        });
    });

    btnMinus.addEventListener("click", function () {
        adjustHp(-1);
    });

    btnPlus.addEventListener("click", function () {
        adjustHp(1);
    });

    slider.addEventListener("input", function () {
        state[state.active] = clamp(Number(slider.value));
        renderTrackerDigits(state.active);
        saveState();
    });

    document.querySelectorAll(".life-quick__btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const setValue = btn.getAttribute("data-set");
            if (setValue !== null) {
                setHp(Number(setValue));
                return;
            }
            const delta = Number(btn.getAttribute("data-delta"));
            if (!Number.isNaN(delta)) {
                adjustHp(delta);
            }
        });
    });

    loadState();
    renderAll();
})();
