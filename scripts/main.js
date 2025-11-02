// DOM Elements
const searchInput = document.getElementById('searchInput');
const toolCards = document.querySelectorAll('.tool-card');
const categorySections = document.querySelectorAll('.category-section');
const noResults = document.getElementById('noResults');

// Search functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let hasResults = false;
    
    categorySections.forEach(section => {
        const cardsInSection = section.querySelectorAll('.tool-card');
        let sectionHasVisibleCards = false;
        
        cardsInSection.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag'))
                .map(tag => tag.textContent.toLowerCase())
                .join(' ');
            
            const matches = searchTerm === '' || 
                          title.includes(searchTerm) || 
                          description.includes(searchTerm) || 
                          tags.includes(searchTerm);
            
            if (matches) {
                card.classList.remove('hidden');
                sectionHasVisibleCards = true;
                hasResults = true;
            } else {
                card.classList.add('hidden');
            }
        });
        
        if (sectionHasVisibleCards) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
    
    if (hasResults || searchTerm === '') {
        noResults.classList.remove('show');
    } else {
        noResults.classList.add('show');
    }
    
    updateCategoryCounts();
}

// Update category counts
function updateCategoryCounts() {
    categorySections.forEach(section => {
        const visibleCards = section.querySelectorAll('.tool-card:not(.hidden)').length;
        const countBadge = section.querySelector('.category-count');
        if (countBadge) {
            countBadge.textContent = visibleCards;
        }
    });
}

// Event listeners
searchInput.addEventListener('input', performSearch);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && 
        document.activeElement !== searchInput && 
        document.activeElement.tagName !== 'INPUT' && 
        document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
    
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        performSearch();
        searchInput.blur();
    }
});

// Initialize
updateCategoryCounts();

// Back to Top Button
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        
        if (href === '#top' || href === '#') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Highlight active category
const navChips = document.querySelectorAll('.nav-chip');
const sections = document.querySelectorAll('.category-section');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navChips.forEach(chip => {
        chip.classList.remove('active');
        if (chip.getAttribute('href') === `#${current}`) {
            chip.classList.add('active');
        }
    });
});
