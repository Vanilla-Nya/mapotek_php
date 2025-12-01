// ========================================
// FILE: animations.js
// PAGE ANIMATIONS FOR LANDING PAGE
// ========================================

console.log("🎨 Initializing page animations...");

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
const navbar = document.getElementById("navbar");

document.addEventListener("scroll", () => {
  if (navbar && !navbar.classList.contains("hidden")) {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
});

// ========================================
// PAGE TWO ANIMATIONS (PROBLEM BOXES)
// ========================================
const section = document.querySelector(".page-two");
const pageTwoInner = document.querySelector(".page-two-inner");
const boxes = document.querySelectorAll(".problem-box");

function updateBoxAnimation() {
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  const isPageTwoFullyVisible = rect.top <= 0;
  const isPageTwoStillVisible = rect.bottom > 0;

  // Hide navbar when page two is fully visible
  if (isPageTwoFullyVisible && isPageTwoStillVisible) {
    navbar.classList.add("hidden");
  } else {
    navbar.classList.remove("hidden");
  }

  // Show page two content
  if (isPageTwoFullyVisible) {
    pageTwoInner.classList.add("visible");
  } else {
    pageTwoInner.classList.remove("visible");
  }

  // Calculate scroll progress
  const scrollableHeight = section.offsetHeight - windowHeight;
  let progress = Math.abs(rect.top) / scrollableHeight;
  progress = Math.max(0, Math.min(1, progress));

  if (!isPageTwoFullyVisible) {
    boxes.forEach((box) => box.classList.remove("show"));
    return;
  }

  // Animate boxes based on scroll progress
  const totalBoxes = boxes.length;
  const progressPerBox = 0.8 / totalBoxes;

  boxes.forEach((box, index) => {
    const boxStartProgress = index * progressPerBox + 0.05;
    if (progress >= boxStartProgress) {
      box.classList.add("show");
    } else {
      box.classList.remove("show");
    }
  });
}

window.addEventListener("scroll", updateBoxAnimation);
window.addEventListener("load", updateBoxAnimation);

// ========================================
// FEATURES SCROLL ANIMATION (PAGE THREE)
// ========================================
const featuresContainer = document.querySelector(".features-scroll-container");
const featureItems = document.querySelectorAll(".feature-item");
const totalFeatures = featureItems.length;

function updateFeaturesScroll() {
  if (!featuresContainer) return;

  const containerRect = featuresContainer.getBoundingClientRect();
  const containerTop = containerRect.top;
  const containerHeight = containerRect.height;
  const windowHeight = window.innerHeight;

  const scrollProgress = Math.max(
    0,
    Math.min(1, -containerTop / (containerHeight - windowHeight))
  );

  const activeIndex = Math.floor(scrollProgress * totalFeatures);

  featureItems.forEach((item, index) => {
    item.classList.remove("active", "past");
    if (index === activeIndex) {
      item.classList.add("active");
    } else if (index < activeIndex) {
      item.classList.add("past");
    }
  });
}

window.addEventListener("scroll", updateFeaturesScroll);
window.addEventListener("load", updateFeaturesScroll);
const purchaseModal = document.getElementById('purchaseDetailModal');
const openPurchaseBtn = document.getElementById('openPurchaseDetail');
const closePurchaseBtn = purchaseModal?.querySelector('.purchase-close');

// Open modal
if (openPurchaseBtn && purchaseModal) {
    openPurchaseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        purchaseModal.style.display = 'flex';
        setTimeout(() => {
            purchaseModal.classList.add('show-modal');
        }, 10);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    });
}

// Close modal with close button
if (closePurchaseBtn && purchaseModal) {
    closePurchaseBtn.addEventListener('click', function() {
        purchaseModal.classList.remove('show-modal');
        setTimeout(() => {
            purchaseModal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    });
}

// Close modal when clicking outside
if (purchaseModal) {
    purchaseModal.addEventListener('click', function(e) {
        if (e.target === purchaseModal) {
            purchaseModal.classList.remove('show-modal');
            setTimeout(() => {
                purchaseModal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    });
}

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && purchaseModal && purchaseModal.classList.contains('show-modal')) {
        purchaseModal.classList.remove('show-modal');
        setTimeout(() => {
            purchaseModal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
});
// ========================================
// VIDEO SECTION ANIMATION
// ========================================
window.addEventListener("scroll", function () {
  const videoSection = document.querySelector(".video-section");
  const videoFrame = document.querySelector(".video-frame");

  if (videoSection && videoFrame) {
    const sectionTop = videoSection.getBoundingClientRect().top;
    const sectionHeight = videoSection.offsetHeight;
    const windowHeight = window.innerHeight;

    if (
      sectionTop < windowHeight / 2 &&
      sectionTop + sectionHeight > windowHeight / 2
    ) {
      videoFrame.classList.add("enlarged");
    } else {
      videoFrame.classList.remove("enlarged");
    }
  }
});

// ========================================
// PHONE MOCKUP FEATURES ROTATION
// ========================================
const phoneFeatureItems = document.querySelectorAll(".phone-feature-item");

// Click to activate
phoneFeatureItems.forEach((item) => {
  item.addEventListener("click", () => {
    phoneFeatureItems.forEach((feature) => feature.classList.remove("active"));
    item.classList.add("active");
  });
});

// Auto-rotate features
let currentFeatureIndex = 0;

function rotateFeatures() {
  phoneFeatureItems.forEach((item) => item.classList.remove("active"));

  if (phoneFeatureItems.length > 0) {
    phoneFeatureItems[currentFeatureIndex].classList.add("active");
    currentFeatureIndex = (currentFeatureIndex + 1) % phoneFeatureItems.length;
  }
}

setInterval(rotateFeatures, 3000);

// Initial active state
if (phoneFeatureItems.length > 0) {
  phoneFeatureItems[0].classList.add("active");
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Ignore modal trigger links
    if (
      href === "#" ||
      this.id === "openLogin" ||
      this.id === "openRegister" ||
      this.id === "toRegister" ||
      this.id === "toLogin"
    ) {
      return;
    }

    e.preventDefault();
    const target = document.querySelector(href);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

console.log("✅ All animations loaded successfully");