// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const themeBtn = document.getElementById('theme-btn');
const themeOptions = document.querySelectorAll('.theme-option');
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const skillBars = document.querySelectorAll('.skill-progress');
const contactForm = document.getElementById('contactForm');
const typewriterElement = document.querySelector('.typewriter');

// Theme Management
let currentTheme = localStorage.getItem('theme') || 'default';

// Initialize theme
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateActiveThemeButton();
    updateNavbarBackground();
}

function updateNavbarBackground() {
    if (!navbar) return;
    
    if (currentTheme === 'dark') {
        navbar.style.background = 'rgba(31, 41, 55, 0.95)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
}

// Update active theme button
function updateActiveThemeButton() {
    themeOptions.forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.style.background = 'var(--primary-color)';
            option.style.color = 'white';
        } else {
            option.style.background = 'transparent';
            option.style.color = '';
        }
    });
}

// Change theme
function changeTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateActiveThemeButton();
    updateNavbarBackground();
}

// Mobile Navigation
function toggleMobileMenu() {
    hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('active');
    hamburger?.setAttribute('aria-expanded', hamburger?.classList.contains('active'));
    
    // Toggle body scroll
    document.body.style.overflow = navMenu?.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu when clicking a link
function closeMobileMenu() {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Active Navigation Link Based on Scroll
function setActiveLink() {
    let scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Animate skill bars when in viewport
function animateSkillBars() {
    skillBars.forEach(bar => {
        const rect = bar.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (isVisible && !bar.classList.contains('animated')) {
            bar.classList.add('animated');
            const width = bar.getAttribute('data-width');
            bar.style.width = `${width}%`;
        }
    });
}

// Typewriter Effect
class Typewriter {
    constructor(element, options = {}) {
        if (!element) {
            console.error('Typewriter: No element provided');
            return;
        }
        
        this.element = element;
        try {
            this.words = JSON.parse(element.getAttribute('data-words') || '[]');
        } catch (e) {
            this.words = ["Web Developer"];
            console.error('Typewriter: Invalid data-words attribute');
        }
        this.wait = parseInt(element.getAttribute('data-wait') || options.wait || 3000);
        this.speed = options.speed || 100;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.wordIndex = 0;
        this.text = '';
        this.isDeleting = false;
        this.isPaused = false;
        this.typeTimeout = null;
        
        this.type();
    }
    
    type() {
        if (this.isPaused || !this.element) return;
        
        const currentWord = this.words[this.wordIndex];
        const fullText = currentWord;
        
        // Check if deleting
        if (this.isDeleting) {
            // Remove char
            this.text = fullText.substring(0, this.text.length - 1);
        } else {
            // Add char
            this.text = fullText.substring(0, this.text.length + 1);
        }
        
        // Insert text into element
        this.element.innerHTML = `<span class="typewriter-text">${this.text}</span>`;
        
        // Type speed
        let typeSpeed = this.speed;
        
        if (this.isDeleting) {
            typeSpeed = this.deleteSpeed;
        }
        
        // If word is complete
        if (!this.isDeleting && this.text === fullText) {
            // Pause at end
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.text === '') {
            this.isDeleting = false;
            // Move to next word
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            typeSpeed = 500;
        }
        
        if (this.typeTimeout) {
            clearTimeout(this.typeTimeout);
        }
        
        this.typeTimeout = setTimeout(() => this.type(), typeSpeed);
    }
    
    pause() {
        this.isPaused = true;
        if (this.typeTimeout) {
            clearTimeout(this.typeTimeout);
        }
    }
    
    resume() {
        this.isPaused = false;
        this.type();
    }
}

// Form Submission Handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';
    
    try {
        // Get form data
        const formData = new FormData(form);
        
        // Send to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.status === 200) {
            // Success
            showNotification('Message sent successfully!', 'success');
            form.reset();
            
            // Reset form labels
            form.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
                input.classList.remove('has-value');
            });
        } else {
            throw new Error(result.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    document.body.appendChild(notification);
}

// Smooth Scrolling for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                closeMobileMenu();
                
                // Calculate position
                const headerOffset = 70;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                // Smooth scroll
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize Intersection Observer for animations
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for skill bars
                if (entry.target.classList.contains('skill-progress')) {
                    const width = entry.target.getAttribute('data-width');
                    setTimeout(() => {
                        entry.target.style.width = `${width}%`;
                    }, 300);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.service-card, .project-card, .skill-progress').forEach(el => {
        observer.observe(el);
    });
}

// Form input label handling
function initFormLabels() {
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    formInputs.forEach(input => {
        // Check if input has value on page load
        if (input.value) {
            input.classList.add('has-value');
        }
        
        // Add event listeners
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });
}

// Navbar scroll effect
function initNavbarScroll() {
    let lastScrollTop = 0;
    
    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.boxShadow = 'var(--shadow)';
            
            // Hide/show navbar on scroll
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    };
    
    window.addEventListener('scroll', handleScroll);
}

// Set current year in footer
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    setCurrentYear();
    
    // Initialize theme
    initTheme();
    
    // Initialize typewriter
    if (typewriterElement) {
        const typewriter = new Typewriter(typewriterElement);
        
        // Pause typewriter when not in viewport
        const typewriterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typewriter.resume();
                } else {
                    typewriter.pause();
                }
            });
        });
        
        typewriterObserver.observe(typewriterElement);
    }
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize intersection observer
    initIntersectionObserver();
    
    // Initialize form labels
    initFormLabels();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Set initial active link
    setActiveLink();
    
    // Animate skill bars on load if in viewport
    setTimeout(animateSkillBars, 500);
});

// Event Listeners

// Theme toggle
themeBtn?.addEventListener('click', () => {
    themeToggle.classList.toggle('active');
});

// Theme selection
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        changeTheme(option.dataset.theme);
        themeToggle.classList.remove('active');
    });
});

// Mobile menu toggle
hamburger?.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    // Close mobile menu
    if (hamburger && navMenu && 
        !hamburger.contains(e.target) && 
        !navMenu.contains(e.target)) {
        closeMobileMenu();
    }
    
    // Close theme options when clicking outside
    if (themeToggle && !themeToggle.contains(e.target)) {
        themeToggle.classList.remove('active');
    }
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Scroll events with throttle
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = requestAnimationFrame(() => {
        setActiveLink();
        animateSkillBars();
        
        // Update navbar background on scroll
        const scrollPosition = window.scrollY;
        if (scrollPosition > 50) {
            if (currentTheme === 'dark') {
                navbar.style.background = 'rgba(31, 41, 55, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            }
        } else {
            if (currentTheme === 'dark') {
                navbar.style.background = 'rgba(31, 41, 55, 0.95)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        }
    });
});

// Form submission
contactForm?.addEventListener('submit', handleFormSubmit);

// Window resize handler
window.addEventListener('resize', () => {
    // Close mobile menu if screen is larger
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
    
    // Re-animate skill bars
    animateSkillBars();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu and theme options
    if (e.key === 'Escape') {
        closeMobileMenu();
        themeToggle.classList.remove('active');
    }
});

// Log visit for debugging
console.log('Portfolio website loaded successfully!');
console.log('Current theme:', currentTheme);