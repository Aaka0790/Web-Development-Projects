// Ensure DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    } else {
        console.error('Mobile menu toggle or nav links not found in the DOM');
    }

    // Sticky Header Scroll Effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    } else {
        console.error('Header element not found in the DOM');
    }

    // Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
// Enhanced Background Effects Script
document.addEventListener('DOMContentLoaded', function() {
    // Create floating shapes
    createFloatingShapes();
    
    // Create particle system
    createParticleSystem();
    
    // Create grid overlay
    createGridOverlay();
    
    // Add parallax effect on scroll
    addParallaxEffect();
    
    // Add mouse interaction effects
    addMouseInteraction();
});

function createFloatingShapes() {
    const shapesContainer = document.createElement('div');
    shapesContainer.className = 'bg-shapes';
    
    for (let i = 0; i < 5; i++) {
        const shape = document.createElement('div');
        shape.className = 'shape';
        shapesContainer.appendChild(shape);
    }
    
    document.body.appendChild(shapesContainer);
}

function createParticleSystem() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
        
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

function createGridOverlay() {
    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'grid-overlay';
    document.body.appendChild(gridOverlay);
}

function addParallaxEffect() {
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const shapes = document.querySelectorAll('.shape');
        const particles = document.querySelector('.particles');
        const gridOverlay = document.querySelector('.grid-overlay');
        
        // Move shapes at different speeds
        shapes.forEach((shape, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrollTop * speed);
            shape.style.transform += ` translateY(${yPos}px)`;
        });
        
        // Move particles slower
        if (particles) {
            particles.style.transform = `translateY(${scrollTop * 0.3}px)`;
        }
        
        // Move grid overlay
        if (gridOverlay) {
            gridOverlay.style.transform = `translate(${scrollTop * 0.1}px, ${scrollTop * 0.1}px)`;
        }
    });
}

function addMouseInteraction() {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Create ripple effect
        createRipple(mouseX, mouseY);
        
        // Move shapes slightly towards mouse
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const rect = shape.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (mouseX - centerX) * 0.01;
            const deltaY = (mouseY - centerY) * 0.01;
            
            shape.style.transform += ` translate(${deltaX}px, ${deltaY}px)`;
        });
    });
}

function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.1)';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '-1';
    ripple.style.animation = 'rippleEffect 1s ease-out forwards';
    
    document.body.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 1000);
}

// Add CSS for ripple effect
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `
    @keyframes rippleEffect {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleCSS);

// Performance optimization - throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll event
const throttledParallax = throttle(addParallaxEffect, 16); // 60fps
window.addEventListener('scroll', throttledParallax);