document.addEventListener('DOMContentLoaded', function() {
    // Check if flag icons are loading properly
    setTimeout(checkFlagIconsLoaded, 500);
    
    // Elements
    const selectedCountry = document.getElementById('selectedCountry');
    const countryDropdown = document.getElementById('countryDropdown');
    const countryList = document.getElementById('countryList');
    const countrySearch = document.getElementById('countrySearch');
    
    // Countries data
    let countries = [];
    
    // Fetch countries from API
    async function fetchCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd');
            const data = await response.json();
            
            // Process and sort countries
            countries = data
                .filter(country => country.idd && country.idd.root && country.idd.suffixes)
                .map(country => {
                    const suffix = country.idd.suffixes[0] || '';
                    return {
                        name: country.name.common,
                        code: country.idd.root + suffix,
                        flag: country.flags.svg,
                        alpha2: country.flags.svg.split('/').pop().slice(0, 2).toLowerCase()
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name));
            
            // Populate country list
            populateCountryList(countries);
            
            // Set default country (India)
            const defaultCountry = countries.find(country => country.alpha2 === 'in') || countries.find(country => country.code === '+91') || countries[0];
            setSelectedCountry(defaultCountry);
        } catch (error) {
            console.error('Error fetching countries:', error);
            // Fallback to a few common countries with India as default
            countries = [
                { name: 'India', code: '+91', alpha2: 'in' },
                { name: 'United States', code: '+1', alpha2: 'us' },
                { name: 'United Kingdom', code: '+44', alpha2: 'gb' },
                { name: 'Canada', code: '+1', alpha2: 'ca' },
                { name: 'Australia', code: '+61', alpha2: 'au' }
            ];
            populateCountryList(countries);
            setSelectedCountry(countries[0]); // India is now the first in the list
        }
    }
    
    // Populate country list
    function populateCountryList(countries) {
        countryList.innerHTML = '';
        countries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            
            if (window.useFlagFallback) {
                // Use fallback display
                countryItem.innerHTML = `
                    <span class="flag-icon" data-country="${country.alpha2.toUpperCase()}">${country.alpha2.toUpperCase()}</span>
                    <span class="country-name">${country.name}</span>
                    <span class="country-code">${country.code}</span>
                `;
            } else {
                // Use normal flag display
                countryItem.innerHTML = `
                    <span class="flag-icon flag-icon-${country.alpha2}"></span>
                    <span class="country-name">${country.name}</span>
                    <span class="country-code">${country.code}</span>
                `;
            }
            
            countryItem.addEventListener('click', () => {
                setSelectedCountry(country);
                toggleDropdown();
            });
            countryList.appendChild(countryItem);
        });
    }
    
    // Set selected country
    function setSelectedCountry(country) {
        // Clear previous content
        selectedCountry.innerHTML = '';
        
        // Create flag element
        const flagSpan = document.createElement('span');
        flagSpan.className = `flag-icon flag-icon-${country.alpha2}`;
        
        // Create code element
        const codeSpan = document.createElement('span');
        codeSpan.className = 'country-code';
        codeSpan.textContent = country.code;
        
        // Create arrow element
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'dropdown-arrow';
        arrowSpan.textContent = '▼';
        
        // Append all elements
        selectedCountry.appendChild(flagSpan);
        selectedCountry.appendChild(codeSpan);
        selectedCountry.appendChild(arrowSpan);
        
        // Store selected country code in a hidden input
        let hiddenInput = document.getElementById('selectedCountryCode');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'selectedCountryCode';
            hiddenInput.name = 'countryCode';
            document.getElementById('signupForm').appendChild(hiddenInput);
        }
        hiddenInput.value = country.code;
    }
    
    // Toggle dropdown
    function toggleDropdown() {
        countryDropdown.classList.toggle('show');
    }
    
    // Search countries
    function searchCountries(query) {
        const filteredCountries = countries.filter(country => 
            country.name.toLowerCase().includes(query.toLowerCase()) || 
            country.code.includes(query)
        );
        populateCountryList(filteredCountries);
    }
    
    // Event listeners
    selectedCountry.addEventListener('click', toggleDropdown);
    
    countrySearch.addEventListener('input', function() {
        searchCountries(this.value);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!selectedCountry.contains(e.target) && !countryDropdown.contains(e.target)) {
            countryDropdown.classList.remove('show');
        }
    });
    
    // Initialize
    fetchCountries();
});

// Add this function to check if flags are loading properly
function checkFlagIconsLoaded() {
    // Create a test flag element
    const testFlag = document.createElement('span');
    testFlag.className = 'flag-icon flag-icon-us';
    testFlag.style.position = 'absolute';
    testFlag.style.opacity = '0';
    document.body.appendChild(testFlag);
    
    // Check if the flag has proper dimensions
    const computedStyle = window.getComputedStyle(testFlag);
    const hasWidth = parseInt(computedStyle.width) > 0;
    
    // Remove test element
    document.body.removeChild(testFlag);
    
    // If flags aren't loading, add fallback CSS
    if (!hasWidth) {
        console.warn('Flag icons not loading properly, adding fallback');
        const style = document.createElement('style');
        style.textContent = `
            .flag-icon {
                display: inline-block;
                width: 20px !important;
                height: 15px !important;
                line-height: 15px;
                text-align: center;
                background-color: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 2px;
                margin-right: 8px;
                font-size: 10px;
                overflow: hidden;
            }
            
            .flag-icon::before {
                content: attr(data-country);
            }
        `;
        document.head.appendChild(style);
        
        // Update flag display method
        window.useFlagFallback = true;
    }
} 