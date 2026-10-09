document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const navbar = document.querySelector(".navbar");

  menuBtn?.addEventListener("click", () => {
    navbar.classList.toggle("mobile-open");
  });

  document.querySelectorAll(".navbar a, .quick-nav a").forEach(link => {
    link.addEventListener("click", () => navbar.classList.remove("mobile-open"));
  });

  const form = document.getElementById("joinForm");
  const popup = document.getElementById("successPopup");
  const closePopup = document.getElementById("closePopup");
  const popupOk = document.getElementById("popupOk");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const mobile = document.getElementById("mobile").value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    popup.classList.add("show");
    form.reset();
  });

  const hidePopup = () => popup.classList.remove("show");
  closePopup?.addEventListener("click", hidePopup);
  popupOk?.addEventListener("click", hidePopup);

  popup?.addEventListener("click", (e) => {
    if (e.target === popup) hidePopup();
  });

  document.querySelectorAll(".register-event").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("join").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => document.getElementById("studentName")?.focus(), 700);
    });
  });

  const searchInput = document.getElementById("searchInput");

  searchInput?.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();

    document.querySelectorAll(".activity-card, .event-card, .feature-card").forEach(card => {
      card.style.display =
        !value || card.textContent.toLowerCase().includes(value) ? "" : "none";
    });
  });

  document.getElementById("notificationBtn")?.addEventListener("click", () => {
    alert("No new notifications.");
  });

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar a");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 130) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + current
      );
    });
  });
});