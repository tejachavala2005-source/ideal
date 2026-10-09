/* =====================================================
   MOBILE MENU
===================================================== */

function toggleMenu() {

    const menu =
        document.getElementById("navLinks");

    menu.classList.toggle("open");

}



/* =====================================================
   TOAST MESSAGE
===================================================== */

function showMessage(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimeout);

    window.toastTimeout =
        setTimeout(function () {

            toast.classList.remove("show");

        }, 2500);

}



/* =====================================================
   COMPETITION REGISTRATION
===================================================== */

function registerCompetition(name) {

    showMessage(
        "Registration selected: " + name
    );

}



/* =====================================================
   CLUB REGISTRATION FORM
===================================================== */

const registrationForm =
    document.getElementById(
        "registrationForm"
    );


registrationForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "studentName"
            ).value.trim();


        const roll =
            document.getElementById(
                "rollNumber"
            ).value.trim();


        const mobile =
            document.getElementById(
                "mobile"
            ).value.trim();


        const year =
            document.getElementById(
                "year"
            ).value;


        const group =
            document.getElementById(
                "group"
            ).value;


        if (
            name === "" ||
            roll === "" ||
            mobile === "" ||
            year === "" ||
            group === ""
        ) {

            showMessage(
                "Please fill all required fields."
            );

            return;

        }


        if (!/^[0-9]{10}$/.test(mobile)) {

            showMessage(
                "Please enter a valid 10-digit mobile number."
            );

            return;

        }


        showMessage(
            "Registration submitted successfully! 🌱"
        );


        registrationForm.reset();

    }
);



/* =====================================================
   SEARCH
===================================================== */

const searchInput =
    document.getElementById(
        "searchInput"
    );


searchInput.addEventListener(
    "input",
    function() {

        const text =
            this.value
                .toLowerCase()
                .trim();


        const competitionCards =
            document.querySelectorAll(
                ".competition-card"
            );


        competitionCards.forEach(
            function(card) {

                const content =
                    card.textContent
                        .toLowerCase();


                if (
                    text === "" ||
                    content.includes(text)
                ) {

                    card.style.display =
                        "";

                } else {

                    card.style.display =
                        "none";

                }

            }
        );


        const activities =
            document.querySelectorAll(
                ".activity-card"
            );


        activities.forEach(
            function(activity) {

                const content =
                    activity.textContent
                        .toLowerCase();


                if (
                    text === "" ||
                    content.includes(text)
                ) {

                    activity.style.display =
                        "";

                } else {

                    activity.style.display =
                        "none";

                }

            }
        );

    }
);



/* =====================================================
   NAVIGATION
===================================================== */

const navLinks =
    document.querySelectorAll(
        ".nav-links a"
    );


navLinks.forEach(function(link) {

    link.addEventListener(
        "click",
        function() {

            document
                .getElementById("navLinks")
                .classList.remove("open");

        }
    );

});



/* =====================================================
   ACTIVE CLUB MENU
===================================================== */

const clubMenuLinks =
    document.querySelectorAll(
        ".club-menu a"
    );


clubMenuLinks.forEach(
    function(link) {

        link.addEventListener(
            "click",
            function() {

                clubMenuLinks.forEach(
                    function(item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );

            }
        );

    }
);