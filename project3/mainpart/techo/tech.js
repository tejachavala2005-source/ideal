/* ==========================================
   i-TECH HUB - MAIN JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       MOBILE MENU
    ========================= */

    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.querySelector(".navbar");

    if (menuBtn && navbar) {

        menuBtn.addEventListener("click", function () {

            navbar.classList.toggle("show");

            const icon = menuBtn.querySelector("i");

            if (navbar.classList.contains("show")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        });

        // Close menu after clicking a navigation link
        document.querySelectorAll(".navbar a").forEach(function (link) {

            link.addEventListener("click", function () {

                navbar.classList.remove("show");

                const icon = menuBtn.querySelector("i");

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            });

        });
    }


    /* =========================
       ACTIVE NAVIGATION
    ========================= */

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".navbar a");

    function updateActiveNavigation() {

        let currentSection = "";

        sections.forEach(function (section) {

            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight
            ) {
                currentSection = section.getAttribute("id");
            }

        });

        navLinks.forEach(function (link) {

            link.classList.remove("active");

            if (
                link.getAttribute("href") === "#" + currentSection
            ) {
                link.classList.add("active");
            }

        });
    }

    window.addEventListener("scroll", updateActiveNavigation);

    updateActiveNavigation();


    /* =========================
       SEARCH
    ========================= */

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener("keyup", function () {

            const searchText = searchInput.value.toLowerCase().trim();

            const searchableCards = document.querySelectorAll(
                ".club-card, .competition-card, .event-box, .gallery-item"
            );

            searchableCards.forEach(function (card) {

                const text = card.innerText.toLowerCase();

                if (searchText === "" || text.includes(searchText)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }

            });

        });
    }


    /* =========================
       NOTIFICATION BUTTON
    ========================= */

    const notificationBtn =
        document.getElementById("notificationBtn");

    if (notificationBtn) {

        notificationBtn.addEventListener("click", function () {

            alert(
                "🔔 Notifications\n\n" +
                "Upcoming events:\n" +
                "• Code Challenge - October 10\n" +
                "• AI Innovation Challenge - October 15\n" +
                "• Web Design Contest - October 20\n" +
                "• Robotics Challenge - October 25"
            );

        });
    }


    /* =========================
       REGISTRATION FORM
    ========================= */

    const registrationForm =
        document.getElementById("registrationForm");

    const successPopup =
        document.getElementById("successPopup");

    const closePopup =
        document.getElementById("closePopup");

    const popupOk =
        document.getElementById("popupOk");


    if (registrationForm) {

        registrationForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const studentName =
                document.getElementById("studentName").value.trim();

            const rollNumber =
                document.getElementById("rollNumber").value.trim();

            const mobile =
                document.getElementById("mobile").value.trim();

            const year =
                document.getElementById("year").value;

            const stream =
                document.getElementById("stream").value;

            const club =
                document.getElementById("club").value;


            /* =========================
               NAME VALIDATION
            ========================= */

            if (studentName.length < 3) {

                alert("Please enter a valid student name.");

                document.getElementById("studentName").focus();

                return;
            }


            /* =========================
               ROLL NUMBER VALIDATION
            ========================= */

            if (rollNumber.length < 2) {

                alert("Please enter a valid roll number.");

                document.getElementById("rollNumber").focus();

                return;
            }


            /* =========================
               MOBILE VALIDATION
            ========================= */

            const mobilePattern = /^[6-9][0-9]{9}$/;

            if (!mobilePattern.test(mobile)) {

                alert(
                    "Please enter a valid 10-digit Indian mobile number."
                );

                document.getElementById("mobile").focus();

                return;
            }


            /* =========================
               SELECT VALIDATION
            ========================= */

            if (year === "") {

                alert("Please select your year of study.");

                document.getElementById("year").focus();

                return;
            }

            if (stream === "") {

                alert("Please select your group / stream.");

                document.getElementById("stream").focus();

                return;
            }

            if (club === "") {

                alert("Please select a tech club.");

                document.getElementById("club").focus();

                return;
            }


            /* =========================
               SAVE REGISTRATION
               TEMPORARILY IN BROWSER
            ========================= */

            const registrationData = {

                studentName: studentName,

                rollNumber: rollNumber,

                mobile: mobile,

                year: year,

                stream: stream,

                club: club,

                registeredAt: new Date().toLocaleString()

            };


            localStorage.setItem(
                "itechHubRegistration",
                JSON.stringify(registrationData)
            );


            /* =========================
               SHOW SUCCESS POPUP
            ========================= */

            if (successPopup) {

                successPopup.classList.add("show");

                document.body.style.overflow = "hidden";
            }

        });
    }


    /* =========================
       CLOSE POPUP
    ========================= */

    function closeSuccessPopup() {

        if (successPopup) {

            successPopup.classList.remove("show");

            document.body.style.overflow = "";

        }

    }


    if (closePopup) {

        closePopup.addEventListener(
            "click",
            closeSuccessPopup
        );

    }


    if (popupOk) {

        popupOk.addEventListener(
            "click",
            closeSuccessPopup
        );

    }


    /* =========================
       CLOSE POPUP ON BACKGROUND
    ========================= */

    if (successPopup) {

        successPopup.addEventListener("click", function (event) {

            if (event.target === successPopup) {

                closeSuccessPopup();

            }

        });

    }


    /* =========================
       ESCAPE KEY
    ========================= */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            if (
                successPopup &&
                successPopup.classList.contains("show")
            ) {
                closeSuccessPopup();
            }

            if (navbar) {
                navbar.classList.remove("show");
            }

        }

    });


    /* =========================
       MOBILE NUMBER INPUT
    ========================= */

    const mobileInput =
        document.getElementById("mobile");

    if (mobileInput) {

        mobileInput.addEventListener("input", function () {

            // Allow numbers only
            this.value = this.value.replace(/\D/g, "");

            // Maximum 10 digits
            if (this.value.length > 10) {

                this.value =
                    this.value.substring(0, 10);

            }

        });

    }


    /* =========================
       REGISTER BUTTONS
    ========================= */

    const registerButtons =
        document.querySelectorAll(".register-event");

    registerButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const registerSection =
                document.getElementById("register");

            if (registerSection) {

                registerSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });


    /* =========================
       CLUB EXPLORE BUTTONS
    ========================= */

    const clubLinks =
        document.querySelectorAll(".club-card a");

    clubLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const clubName =
                this.closest(".club-card")
                    .querySelector("h3")
                    .textContent;

            alert(
                clubName +
                "\n\nMore club activities will be available soon."
            );

        });

    });


    /* =========================
       QUICK NAV ACTIVE STATE
    ========================= */

    const quickLinks =
        document.querySelectorAll(".quick-nav a");

    quickLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            quickLinks.forEach(function (item) {

                item.classList.remove("quick-active");

            });

            this.classList.add("quick-active");

        });

    });


    /* =========================
       FOOTER YEAR
    ========================= */

    const footerYear =
        document.querySelector(".footer-bottom p");

    if (footerYear) {

        const currentYear =
            new Date().getFullYear();

        footerYear.innerHTML =
            `© ${currentYear} IDEAL Degree & PG College. All Rights Reserved.`;

    }


    /* =========================
       LOAD SAVED REGISTRATION
    ========================= */

    const savedRegistration =
        localStorage.getItem("itechHubRegistration");

    if (savedRegistration) {

        try {

            const data =
                JSON.parse(savedRegistration);

            console.log(
                "Previous i-Tech Hub registration:",
                data
            );

        } catch (error) {

            console.log(
                "Unable to load previous registration."
            );

        }

    }

});