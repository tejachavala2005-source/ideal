// =============================
// MOBILE MENU
// =============================

function toggleMenu() {

    const navigation =
        document.getElementById("navigation");

    navigation.classList.toggle("open");
}



// =============================
// TOAST MESSAGE
// =============================

function showMessage(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer =
        setTimeout(function () {

            toast.classList.remove("show");

        }, 2500);
}



// =============================
// COMPETITION REGISTRATION
// (requires login)
// =============================

function registerEvent(eventName, clubName) {

    if (!window.IdealAuth || !IdealAuth.current()) {
        showMessage("Please login to register for " + eventName);

        setTimeout(function () {

            if (window.IdealAuth) {
                IdealAuth.requireLogin();
            }

        }, 1200);

        return;
    }

    var result =
        IdealAuth.addRegistration(
            "Competition",
            eventName,
            clubName || ""
        );

    if (result === "duplicate") {

        showMessage(
            "You are already registered for " + eventName
        );

    } else {

        showMessage(
            "Registered successfully for " +
            eventName +
            " \u2705"
        );
    }
}



// =============================
// QUICK ACTIONS
// =============================

function scrollToCompetitions() {

    document.getElementById("competitions")
        .scrollIntoView({
            behavior: "smooth"
        });
}


function scrollToClubs() {

    document.getElementById("clubs")
        .scrollIntoView({
            behavior: "smooth"
        });

    showMessage(
        "Choose a club and use its Join Club form"
    );
}


function contactUs() {

    window.location.href =
        "mailto:clubs@idealcollege.edu.in?subject=Clubs%20%26%20Competitions%20Enquiry";
}


function showMyRegistrations() {

    if (!window.IdealAuth || !IdealAuth.current()) {

        showMessage(
            "Please login to see your registrations"
        );

        setTimeout(function () {

            if (window.IdealAuth) {
                IdealAuth.requireLogin();
            }

        }, 1200);

        return;
    }

    var list =
        IdealAuth.getRegistrations();

    var box =
        document.getElementById("regModal");

    if (!box) {

        box =
            document.createElement("div");

        box.id = "regModal";

        box.className = "reg-modal";

        box.innerHTML =
            '<div class="reg-box">' +
            '<button class="reg-close" aria-label="Close">&times;</button>' +
            '<h3>My Registrations</h3>' +
            '<div class="reg-list"></div>' +
            '</div>';

        document.body.appendChild(box);

        box.addEventListener(
            "click",
            function (e) {

                if (
                    e.target === box ||
                    e.target.className === "reg-close"
                ) {

                    box.classList.remove("show");
                }
            }
        );
    }

    var html = "";

    if (list.length === 0) {

        html =
            "<p>No registrations yet. Register for a competition to see it here.</p>";

    } else {

        list.forEach(function (r) {

            var li =
                document.createElement("div");

            li.textContent =
                r.title +
                (r.club ? " \u2022 " + r.club : "") +
                " (" +
                r.type +
                ", " +
                r.date +
                ")";

            html +=
                "<div class='reg-item'>" +
                li.innerHTML +
                "</div>";
        });
    }

    box.querySelector(".reg-list").innerHTML =
        html;

    box.classList.add("show");
}



// =============================
// CLUB CAROUSEL
// =============================

const clubsGrid =
    document.getElementById("clubsGrid");

const prevClubSide =
    document.getElementById("prevClubSide");

const nextClubSide =
    document.getElementById("nextClubSide");

const viewAllClubs =
    document.getElementById("viewAllClubs");

let clubPage = 0;


// 4 clubs on desktop, 2 on mobile
function getVisibleClubs() {

    if (window.innerWidth <= 760) return 2;
    if (window.innerWidth <= 1000) return 3;
    return 4;
}


// Calculate how many positions we can slide
function getMaxClubPage() {

    const totalClubs =
        document.querySelectorAll(
            "#clubsGrid .club-card"
        ).length;

    return Math.max(
        0,
        totalClubs - getVisibleClubs()
    );
}


// Slide one card at a time
function updateClubCarousel() {

    if (!clubsGrid) return;

    const cards =
        clubsGrid.querySelectorAll(
            ".club-card"
        );

    if (!cards.length) return;

    const maxPage =
        getMaxClubPage();

    if (clubPage > maxPage) {
        clubPage = maxPage;
    }

    const firstCard =
        cards[0];

    const cardWidth =
        firstCard.getBoundingClientRect().width;

    const gridStyle =
        window.getComputedStyle(clubsGrid);

    const gap =
        parseFloat(gridStyle.columnGap || gridStyle.gap || 0);

    const move =
        clubPage * (cardWidth + gap);

    clubsGrid.style.transform =
        "translateX(-" + move + "px)";


    const atStart =
        clubPage === 0;

    const atEnd =
        clubPage === maxPage;


    if (prevClubSide) {
        prevClubSide.disabled = atStart;
    }

    if (nextClubSide) {
        nextClubSide.disabled = atEnd;
    }


    if (viewAllClubs) {

        if (atEnd) {

            viewAllClubs.textContent =
                "View First Clubs";

        } else {

            viewAllClubs.textContent =
                "View All Clubs";
        }
    }
}


// Next arrow
function nextClubSlide() {

    if (clubPage < getMaxClubPage()) {

        clubPage++;

        updateClubCarousel();
    }
}


// Previous arrow
function previousClubSlide() {

    if (clubPage > 0) {

        clubPage--;

        updateClubCarousel();
    }
}


// Side arrows
if (nextClubSide) {
    nextClubSide.addEventListener(
        "click",
        nextClubSlide
    );
}

if (prevClubSide) {
    prevClubSide.addEventListener(
        "click",
        previousClubSlide
    );
}


// View All Clubs
if (viewAllClubs) {

    viewAllClubs.addEventListener(
        "click",
        function () {

            if (clubPage === getMaxClubPage()) {

                clubPage = 0;

            } else {

                clubPage =
                    getMaxClubPage();
            }

            updateClubCarousel();
        }
    );
}


// Update after resizing
window.addEventListener(
    "resize",
    function () {

        updateClubCarousel();

    }
);


// Initial position
updateClubCarousel();



// =============================
// UPCOMING COMPETITIONS
// SHOW 2 FIRST, VIEW ALL FOR ALL
// =============================

const competitionGrid =
    document.getElementById("competitionGrid");

const viewAllCompetitions =
    document.getElementById("viewAllCompetitions");

if (
    competitionGrid &&
    viewAllCompetitions
) {

    viewAllCompetitions.addEventListener(
        "click",
        function () {

            const showingAll =
                competitionGrid.classList.contains(
                    "show-all"
                );

            if (showingAll) {

                // Back to first 2
                competitionGrid.classList.remove(
                    "show-all"
                );

                viewAllCompetitions.textContent =
                    "View All →";

            } else {

                // Show all competitions
                competitionGrid.classList.add(
                    "show-all"
                );

                viewAllCompetitions.textContent =
                    "Show Less ↑";
            }
        }
    );
}



// =============================
// SEARCH
// =============================

const searchInput =
    document.getElementById("searchInput");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchText =
                this.value
                    .toLowerCase()
                    .trim();


            // Search clubs

        const clubs =
            document.querySelectorAll(
                ".club-card"
            );

        clubs.forEach(function (club) {

            const name =
                (club.dataset.name || "")
                    .toLowerCase();

            if (
                searchText === "" ||
                name.includes(searchText)
            ) {

                club.style.display = "";

            } else {

                club.style.display = "none";
            }

        });

        // Return to the first cards after searching
        clubPage = 0;

        setTimeout(function () {
            updateClubCarousel();
        }, 0);


        // Search competitions

            const competitions =
                document.querySelectorAll(
                    ".competition-card"
                );


            competitions.forEach(
                function (competition) {

                    const name =
                        (
                            competition.dataset.name ||
                            ""
                        ).toLowerCase();


                    if (
                        searchText === "" ||
                        name.includes(searchText)
                    ) {

                        /*
                         * Empty search returns to the normal
                         * first-2 state unless user selected
                         * View All.
                         */
                        if (
                            searchText === "" &&
                            competition.classList.contains(
                                "hidden-competition"
                            ) &&
                            !competitionGrid.classList.contains(
                                "show-all"
                            )
                        ) {

                            competition.style.display =
                                "none";

                        } else {

                            competition.style.display =
                                "grid";
                        }

                    } else {

                        competition.style.display =
                            "none";
                    }

                }
            );

        }
    );
}



// =============================
// NAVIGATION ACTIVE LINK
// =============================

const navLinks =
    document.querySelectorAll(
        ".navigation a"
    );


navLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            navLinks.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            this.classList.add("active");


            const navigation =
                document.getElementById(
                    "navigation"
                );

            if (navigation) {

                navigation.classList.remove(
                    "open"
                );
            }

        }
    );

});



// =============================
// CLOSE MENU WHEN CLICKING
// OUTSIDE NAVIGATION
// =============================

document.addEventListener(
    "click",
    function (event) {

        const navigation =
            document.getElementById(
                "navigation"
            );

        const menuButton =
            document.querySelector(
                ".menu-btn"
            );


        if (
            navigation &&
            menuButton &&
            !navigation.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {

            navigation.classList.remove(
                "open"
            );

        }

    }
);



// =============================
// HELP DESK: status, reveal, report options
// =============================

(function () {

    var panel = document.getElementById("helpdesk");
    if (!panel) return;

    // ---- live open / closed badge (Mon-Sat, 9:00-16:30 IST)

    function updateStatus() {

        var badge = document.getElementById("helpdeskStatus");
        if (!badge) return;

        var parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Kolkata",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
            hour12: false
        }).formatToParts(new Date());

        var info = {};
        parts.forEach(function (p) { info[p.type] = p.value; });

        var minutes = (parseInt(info.hour, 10) % 24) * 60 + parseInt(info.minute, 10);
        var isSunday = info.weekday === "Sun";
        var isOpen = !isSunday && minutes >= 9 * 60 && minutes < 16 * 60 + 30;

        badge.className = "helpdesk-status " + (isOpen ? "open" : "closed");
        badge.querySelector("b").textContent = isOpen
            ? "We're open now"
            : "Closed right now";
    }

    updateStatus();
    setInterval(updateStatus, 60000);


    // ---- staggered reveal on scroll

    var items = panel.querySelectorAll(".helpdesk-card, .report-panel");

    if ("IntersectionObserver" in window) {

        document.documentElement.classList.add("hd-js");

        items.forEach(function (el, i) {
            el.style.setProperty("--d", (i * 0.08) + "s");
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        items.forEach(function (el) { io.observe(el); });
    }


    // ---- report options

    var wrap     = document.getElementById("reportFormWrap");
    var form     = document.getElementById("reportForm");
    var done     = document.getElementById("reportDone");
    var chips    = panel.querySelectorAll(".report-chip");
    var typeLbl  = document.getElementById("reportTypeLabel");
    var nameEl   = document.getElementById("reportName");
    var contact  = document.getElementById("reportEmail");
    var details  = document.getElementById("reportDetails");
    var count    = document.getElementById("reportCount");
    var errorEl  = document.getElementById("reportError");
    var selected = "";

    if (!wrap || !form) return;

    function closeForm() {
        wrap.classList.remove("open");
        chips.forEach(function (c) { c.classList.remove("active"); });
        selected = "";
    }

    function openFor(type, chip) {

        selected = type;
        typeLbl.textContent = type;

        chips.forEach(function (c) { c.classList.toggle("active", c === chip); });

        form.hidden = false;
        done.hidden = true;
        errorEl.textContent = "";

        // prefill the name for logged-in students
        try {
            var user = window.IdealAuth && IdealAuth.current();
            if (user && user.name && !nameEl.value) nameEl.value = user.name;
        } catch (e) {}

        wrap.classList.add("open");
        setTimeout(function () { details.focus({ preventScroll: true }); }, 250);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            // clicking the active chip again closes the form
            if (chip.classList.contains("active")) { closeForm(); return; }
            openFor(chip.getAttribute("data-type"), chip);
        });
    });

    details.addEventListener("input", function () {
        count.textContent = details.value.length + " / 500";
    });

    document.getElementById("reportCancel").addEventListener("click", closeForm);

    document.getElementById("reportAnother").addEventListener("click", function () {
        closeForm();
    });

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        var name = nameEl.value.trim();
        var text = details.value.trim();

        if (!name || text.length < 10) {

            errorEl.textContent = !name
                ? "Please enter your name."
                : "Please add a few more details (at least 10 characters).";

            form.classList.remove("shake");
            void form.offsetWidth;          // restart the animation
            form.classList.add("shake");
            return;
        }

        var ref = "IC-" + Math.floor(1000 + Math.random() * 9000);

        // front-end demo: stored in this browser only (same as login/registration)
        try {
            var list = JSON.parse(localStorage.getItem("idealReports") || "[]");
            list.push({
                ref: ref,
                type: selected,
                name: name,
                contact: contact.value.trim(),
                details: text,
                time: new Date().toISOString()
            });
            localStorage.setItem("idealReports", JSON.stringify(list));
        } catch (e) {}

        document.getElementById("reportRef").textContent = ref;

        form.hidden = true;
        done.hidden = false;
        form.reset();
        count.textContent = "0 / 500";
        errorEl.textContent = "";
        chips.forEach(function (c) { c.classList.remove("active"); });

        showMessage("Report " + ref + " submitted");
    });

})();
