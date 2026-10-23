const btn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");

function setOpen(open) {
    btn.setAttribute("aria-expanded", String(open));
    btn.classList.toggle("is-open", open);
    menu.hidden = !open;
}

btn.addEventListener("click", () => setOpen(menu.hidden));

// Click anywhere else to close
document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) {
        setOpen(false);
    }
});

// Escape closes and returns focus to the button
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
        setOpen(false);
        btn.focus();
    }
});

// Who we are: a pinned stage whose frames change as you scroll
const scene = document.querySelector(".scene");
if (scene) {
    const stage = scene.querySelector(".stage");
    const frames = [...scene.querySelectorAll(".frame")];
    const noMotionPref = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let nav = null;
    let dots = [];
    let enabled = false;
    let current = -1;
    let ticking = false;

    function setActive(i) {
        if (i === current) return;
        current = i;
        frames.forEach((f, k) => f.classList.toggle("active", k === i));
        dots.forEach((d, k) => {
            if (k === i) d.setAttribute("aria-current", "true");
            else d.removeAttribute("aria-current");
        });
    }

    function update() {
        ticking = false;
        const distance = scene.offsetHeight - stage.offsetHeight;
        const progress = Math.min(1, Math.max(0, -scene.getBoundingClientRect().top / distance));
        setActive(Math.min(frames.length - 1, Math.floor(progress * frames.length)));
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    function goTo(i) {
        const distance = scene.offsetHeight - stage.offsetHeight;
        const top = window.scrollY + scene.getBoundingClientRect().top;
        window.scrollTo({ top: top + ((i + 0.5) / frames.length) * distance, behavior: "smooth" });
    }

    function buildNav() {
        nav = document.createElement("div");
        nav.className = "stage-nav";
        frames.forEach((f, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.setAttribute("aria-label", "Go to: " + f.dataset.label);
            b.addEventListener("click", () => goTo(i));
            nav.appendChild(b);
            dots.push(b);
        });
        stage.appendChild(nav);
    }

    function enable() {
        enabled = true;
        scene.style.setProperty("--n", frames.length);
        scene.classList.add("scrolly");
        if (!nav) buildNav();
        nav.hidden = false;
        current = -1;
        update();
    }

    function disable() {
        enabled = false;
        scene.classList.remove("scrolly");
        if (nav) nav.hidden = true;
    }

    // Scrolling mode needs motion to be okay and enough screen height; otherwise frames just stack.
    function evaluate() {
        const should = noMotionPref.matches && window.innerHeight >= 620;
        if (should && !enabled) enable();
        else if (!should && enabled) disable();
        else if (enabled) update();
    }

    window.addEventListener("scroll", () => { if (enabled) onScroll(); }, { passive: true });
    window.addEventListener("resize", evaluate);
    noMotionPref.addEventListener("change", evaluate);
    evaluate();
}