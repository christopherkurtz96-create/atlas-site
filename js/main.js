// Atlas Excavation & Demolition - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const body = document.body;

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            body.classList.toggle('nav-open');
        });

        // Close mobile nav when clicking a link
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                mobileToggle.classList.remove('active');
                body.classList.remove('nav-open');
            });
        });
    }

    // Header Scroll Effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Testimonial Slider (simple implementation)
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    if (testimonialDots.length > 0) {
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                // Remove active class from all dots
                testimonialDots.forEach(d => d.classList.remove('active'));
                // Add active to clicked dot
                this.classList.add('active');
                // Show corresponding testimonial (if multiple exist)
                // For now, just visual feedback
            });
        });
    }

    // Form validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic validation
            const name = this.querySelector('[name="name"]');
            const email = this.querySelector('[name="email"]');
            const phone = this.querySelector('[name="phone"]');
            const message = this.querySelector('[name="message"]');

            let isValid = true;

            // Clear previous errors
            this.querySelectorAll('.error-message').forEach(el => el.remove());
            this.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

            if (name && !name.value.trim()) {
                showError(name, 'Please enter your name');
                isValid = false;
            }

            if (email && !isValidEmail(email.value)) {
                showError(email, 'Please enter a valid email');
                isValid = false;
            }

            if (phone && !phone.value.trim()) {
                showError(phone, 'Please enter your phone number');
                isValid = false;
            }

            if (message && !message.value.trim()) {
                showError(message, 'Please enter a message');
                isValid = false;
            }

            if (isValid) {
                const form = this;
                const formData = new FormData(form);
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';

                fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                })
                .then(function(response) {
                    if (response.ok) {
                        window.location.href = '/thank-you.html';
                    } else {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Send Request';
                        alert('Something went wrong. Please try again or call us at (573) 200-6499.');
                    }
                })
                .catch(function() {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Request';
                    alert('Something went wrong. Please try again or call us at (573) 200-6499.');
                });
            }
        });
    }

    function showError(input, message) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#F74500';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '5px';
        input.parentNode.appendChild(errorDiv);
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .sub-service-card, .process-step, .about-feature, .area-card');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;

            if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animated elements
    const setInitialAnimationState = function() {
        const elements = document.querySelectorAll('.service-card, .sub-service-card, .process-step, .about-feature, .area-card');
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
    };

    // Initialize animations
    setInitialAnimationState();
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = '(' + value.substring(0,3) + ') ' + value.substring(3,6) + '-' + value.substring(6,10);
            } else if (value.length >= 3) {
                value = '(' + value.substring(0,3) + ') ' + value.substring(3);
            }
            e.target.value = value;
        });
    });

    // Lazy loading images (native support with fallback)
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lozad.js/1.16.0/lozad.min.js';
        document.body.appendChild(script);
    }
});

// Service worker registration for better performance (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}
