document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper carousel with keyboard and touch controls
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        // Enable keyboard navigation
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        // Enable touch navigation
        touchEventsTarget: 'container',
        touchRatio: 1,
        touchAngle: 45,
        grabCursor: true,
        // Pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Add keyboard event listeners for arrow keys
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            swiper.slidePrev();
        } else if (e.key === 'ArrowRight') {
            swiper.slideNext();
        }
    });
    
    // Handle dashboard fade transition
    setTimeout(function() {
        const initialDashboard = document.getElementById('initial-dashboard');
        const mainContent = document.getElementById('main-content');
        
        if (initialDashboard && mainContent) {
            // Fade out the initial dashboard
            initialDashboard.classList.add('fade-out');
            
            // After the fade-out animation completes
            setTimeout(function() {
                initialDashboard.style.display = 'none';
                mainContent.style.display = 'block';
                
                // Force a reflow
                void mainContent.offsetWidth;
                
                // Start fade-in animation for main content
                mainContent.classList.add('fade-in');
                
                // Initialize/update Swiper after content is visible
                swiper.update();
            }, 500);
        }
    }, 4000);
}); 