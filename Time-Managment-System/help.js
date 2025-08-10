document.addEventListener("DOMContentLoaded", () => {
    // FAQ Toggle (show/hide answers)
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const answer = item.querySelector(".answer");

        item.addEventListener("click", () => {
            // Toggle visibility of the answer
            const isVisible = answer.style.display === "block";
            answer.style.display = isVisible ? "none" : "block";

            // Add smooth scroll animation when showing the answer
            if (!isVisible) {
                answer.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
});



