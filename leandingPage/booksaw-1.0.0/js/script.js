(function($) {

  "use strict";

  const tabs = document.querySelectorAll('[data-tab-target]')
  const tabContents = document.querySelectorAll('[data-tab-content]')

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = document.querySelector(tab.dataset.tabTarget)
      tabContents.forEach(tabContent => {
        tabContent.classList.remove('active')
      })
      tabs.forEach(tab => {
        tab.classList.remove('active')
      })
      tab.classList.add('active')
      target.classList.add('active')
    })
  });

  // Responsive Navigation with Button

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".menu-list");

  hamburger.addEventListener("click", mobileMenu);

  function mobileMenu() {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("responsive");
  }

  const navLink = document.querySelectorAll(".nav-link");

  navLink.forEach(n => n.addEventListener("click", closeMenu));

  function closeMenu() {
      hamburger.classList.remove("active");
      navMenu.classList.remove("responsive");
  }

  // Menangani perubahan warna navbar saat scroll dan navigasi section
  var handleNavbar = function() {
    var scroll = $(window).scrollTop();
    var homeSection = $('#home');
    var homeTop = homeSection.offset().top;
    var homeBottom = homeTop + homeSection.outerHeight();
    
    // Cek apakah sedang di section home
    if (scroll >= homeTop && scroll <= homeBottom) {
      // Jika di dalam home section, tambahkan class scrolled (navbar biru)
      $('#header').addClass("scrolled").removeClass("fixed-top");
    } 
    // Jika di luar home section dan scroll lebih dari 200px, gunakan fixed-top scrolled
    else if (scroll >= 200) {
      $('#header').addClass("fixed-top scrolled");
    } 
    // Jika di luar home section dan scroll kurang dari 200px, hapus semua class
    else {
      $('#header').removeClass("fixed-top scrolled");
    }

    // Update active link di navbar
    $('section').each(function() {
      var currentSection = $(this);
      var sectionTop = currentSection.offset().top;
      var sectionBottom = sectionTop + currentSection.outerHeight();
      var sectionId = currentSection.attr('id');
      var navLink = $('a[href="#' + sectionId + '"]');
      
      if (scroll >= sectionTop - 100 && scroll < sectionBottom - 100) {
        // Hapus class active dari semua link
        $('.menu-list a').removeClass('active');
        // Tambahkan class active ke link yang sesuai
        navLink.addClass('active');
      }
    });
  }

  $(window).scroll(function() {    
    handleNavbar();
  }); 

  $(document).ready(function(){
    handleNavbar();
    
    Chocolat(document.querySelectorAll('.image-link'), {
        imageSize: 'contain',
        loop: true,
    })

    $('#header-wrap').on('click', '.search-toggle', function(e) {
      var selector = $(this).data('selector');

      $(selector).toggleClass('show').find('.search-input').focus();
      $(this).toggleClass('active');

      e.preventDefault();
    });


    // close when click off of container
    $(document).on('click touchstart', function (e){
      if (!$(e.target).is('.search-toggle, .search-toggle *, #header-wrap, #header-wrap *')) {
        $('.search-toggle').removeClass('active');
        $('#header-wrap').removeClass('show');
      }
    });

    $('.main-slider').slick({
        autoplay: false,
        autoplaySpeed: 4000,
        fade: true,
        dots: true,
        prevArrow: $('.prev'),
        nextArrow: $('.next'),
    }); 

    $('.product-grid').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        dots: true,
        arrows: false,
        responsive: [
          {
            breakpoint: 1400,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 999,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 660,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
          // You can unslick at a given breakpoint now by adding:
          // settings: "unslick"
          // instead of a settings object
        ]
    });

    AOS.init({
      duration: 1200,
      once: true,
    })

    jQuery('.stellarnav').stellarNav({
      theme: 'plain',
      closingDelay: 250,
      // mobileMode: false,
    });

  }); // End of a document
const modal = document.getElementById("authModal");
const openLogin = document.getElementById("openLogin");
const openRegister = document.getElementById("openRegister");
const closeBtn = document.querySelector(".close");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toRegister = document.getElementById("toRegister");
const toLogin = document.getElementById("toLogin");

if (openLogin) {
  openLogin.onclick = () => {
    modal.style.display = "flex";
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  };
}

if (openRegister) {
  openRegister.onclick = () => {
    modal.style.display = "flex";
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  };
}

if (toRegister) {
  toRegister.onclick = (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  };
}

if (toLogin) {
  toLogin.onclick = (e) => {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
  };
}

if (closeBtn) {
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
}

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

  const container = document.querySelector('.review-container');
  const btnLeft = document.getElementById('scrollLeft');
  const btnRight = document.getElementById('scrollRight');

  btnLeft.addEventListener('click', () => {
    container.scrollBy({ left: -container.clientWidth / 3, behavior: 'smooth' });
  });

  btnRight.addEventListener('click', () => {
    container.scrollBy({ left: container.clientWidth / 3, behavior: 'smooth' });
  });
(function () {
  "use strict";

  const testimonials = [
    {
      name: "Aldi",
      role: "Dokter umum",
      company: "RSUD Jember",
      text: "bagussss banget",
      avatar: "linear-gradient(135deg, #667eea 0%, #667eea99 100%)",
    },
    {
      name: "levi",
      role: "dokter gigi",
      company: "Klinik Gigi Sehat",
      text: "pasien saya meningkat 50% setelah pakai aplikasi ini",
      avatar: "linear-gradient(135deg, #764ba2 0%, #764ba299 100%)",
    },
    {
      name: "ahmad sahroni",
      role: "dokter umum",
      company: "rsud bondwoso",
      text: "manajemennya rapi dan mudah digunakan",
      avatar: "linear-gradient(135deg, #f093fb 0%, #f093fb99 100%)",
    },
    {
      name: "thorfinn",
      role: "dokter spesialis anak",
      company: "RSIA Bunda",
      text: "tampilan aplikasinya menarik dan user friendly",
      avatar: "linear-gradient(135deg, #4facfe 0%, #4facfe99 100%)",
    },
    {
      name: "Hitler",
      role: "dokter umum",
      company: "RSUD Bayern Munich",
      text: "sangat membantu pekerjaan saya",
      avatar: "linear-gradient(135deg, #43e97b 0%, #43e97b99 100%)",
    },
  ];

  let centerIndex = 1;
  let isTransitioning = false;
  const totalCards = testimonials.length;
  let autoplayInterval = null;
  const cardElements = [];

  function createCardHTML(testimonial) {
    return `
                    <div class="quote-icon">"</div>
                    <div class="card-header">
                        <div class="avatar" style="background: ${testimonial.avatar};"></div>
                        <div class="user-info">
                            <div class="user-name">${testimonial.name}</div>
                            <div class="user-role">${testimonial.role}</div>
                        </div>
                    </div>
                    <div class="stars">★★★★★</div>
                    <div class="testimonial-text">${testimonial.text}</div>
                    <div class="card-footer">
                        <div class="company">
                            <div class="company-icon"></div>
                            <span>${testimonial.company}</span>
                        </div>
                        <div class="verified">Verified</div>
                    </div>
                `;
  }

  function initCarousel() {
    const wrapper = document.getElementById("carouselWrapper");
    const dotsContainer = document.getElementById("dotsContainer");

    if (!wrapper || !dotsContainer) {
      console.error("Carousel elements not found");
      return;
    }

    testimonials.forEach((testimonial, index) => {
      const card = document.createElement("div");
      card.className = "testimonial-card";
      card.setAttribute("data-index", index);
      card.setAttribute("data-position", "hidden");
      card.innerHTML = createCardHTML(testimonial);
      wrapper.appendChild(card);
      cardElements.push(card);
    });

    testimonials.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "dot";
      if (index === centerIndex) {
        dot.classList.add("active");
      }
      dot.setAttribute("data-index", index);
      dot.addEventListener("click", function () {
        goToSlide(parseInt(this.getAttribute("data-index")));
      });
      dotsContainer.appendChild(dot);
    });

    updateCarousel();
  }

  function updateCarousel() {
    const leftIndex = (centerIndex - 1 + totalCards) % totalCards;
    const rightIndex = (centerIndex + 1) % totalCards;

    cardElements.forEach((card, index) => {
      if (index === leftIndex) {
        card.setAttribute("data-position", "left");
      } else if (index === centerIndex) {
        card.setAttribute("data-position", "center");
      } else if (index === rightIndex) {
        card.setAttribute("data-position", "right");
      } else {
        card.setAttribute("data-position", "hidden");
      }
    });

    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
      if (index === centerIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  function nextSlide() {
    if (isTransitioning) return;

    isTransitioning = true;
    centerIndex = (centerIndex + 1) % totalCards;
    updateCarousel();

    setTimeout(function () {
      isTransitioning = false;
    }, 600);
  }

  function goToSlide(index) {
    if (isTransitioning || index === centerIndex) return;

    isTransitioning = true;
    centerIndex = index;
    updateCarousel();

    setTimeout(function () {
      isTransitioning = false;
    }, 600);

    resetAutoplay();
  }

  function startAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
    autoplayInterval = setInterval(nextSlide, 4000);
  }

  function resetAutoplay() {
    startAutoplay();
  }

  function init() {
    initCarousel();
    startAutoplay();
    let resizeTimeout;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        isTransitioning = false;
        if (autoplayInterval) {
          clearInterval(autoplayInterval);
        }
        startAutoplay();
      }, 250);
    });

    // Handle window focus/blur
    window.addEventListener("blur", function () {
      // Window lost focus, but keep autoplay running
      // Do nothing here - let autoplay continue
    });

    const container = document.querySelector(".carousel-container");
    // if (container) {
    //   container.addEventListener("mouseenter", function () {
    //     // Only pause if mouse is actually over the container and page is visible
    //     if (!document.hidden && autoplayInterval) {
    //       clearInterval(autoplayInterval);
    //     }
    //   });

    //   container.addEventListener("mouseleave", function () {
    //     // Only restart if page is visible
    //     if (!document.hidden) {
    //       startAutoplay();
    //     }
    //   });
    // }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
// untuk pergerakan video
// JavaScript untuk memantau scroll
window.addEventListener("scroll", function () {
  const videoSection = document.querySelector(".video-section");
  const videoFrame = document.querySelector(".video-frame");

  const sectionTop = videoSection.getBoundingClientRect().top;
  const sectionHeight = videoSection.offsetHeight;
  const windowHeight = window.innerHeight;

  // Jika section masuk di tengah viewport
  if (sectionTop < windowHeight / 2 && sectionTop + sectionHeight > windowHeight / 2) {
    videoFrame.classList.add("enlarged");
  } else {
    videoFrame.classList.remove("enlarged");
  }
});


// 


})(jQuery);