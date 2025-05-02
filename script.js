document.addEventListener('DOMContentLoaded', () => {
    const theaterSelect = document.getElementById('theaterSelect');
    const movieContainer = document.getElementById('movies');
    
    // Haetaan teatterit
    fetchTheaters();
    
    // Lisätään kuuntelija, teatterin valinta
    theaterSelect.addEventListener('change', () => {
        const theaterId = theaterSelect.value;
        if (!theaterId) {
            movieContainer.innerHTML = "";
            return;
        }
        fetchMovies(theaterId);
    });
    
    // Teattereiden haku
    function fetchTheaters() {
        fetch('https://www.finnkino.fi/xml/TheatreAreas/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(xmlText => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlText, "text/xml");
                displayTheaters(xml.getElementsByTagName("TheatreArea"));
            })
            .catch(error => {
                console.error('Virhe teatteritietojen haussa:', error);
                theaterSelect.innerHTML = "<option value=''>Virhe teattereiden haussa</option>";
            });
    }
    
    // Teattereiden näyttäminen
    function displayTheaters(theaterData) {
        theaterSelect.innerHTML = "<option value=''>Valitse teatteri</option>";
        Array.from(theaterData).forEach(theater => {
            const name = theater.getElementsByTagName("Name")[0].textContent;

            const excludedTheaters = ["Valitse alue/teatteri", "Pääkaupunkiseutu", "Espoo", "Helsinki", "Tampere", "Turku ja Raisio"];

            if (!excludedTheaters.includes(name)) {
                const id = theater.getElementsByTagName("ID")[0].textContent;
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                theaterSelect.appendChild(option);
            }
        });
    }
    
    // Elokuvien haku
    function fetchMovies(theaterId) {
        movieContainer.innerHTML = "<p>Ladataan elokuvia...</p>";
        
        fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(xmlText => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlText, "text/xml");
                const movies = xml.getElementsByTagName("Show");
                displayMovies(movies);
            })
            .catch(error => {
                console.error('Virhe haettaessa elokuvia:', error);
                movieContainer.innerHTML = "<p>Virhe elokuvien haussa</p>";
            });
    }
    
    // Elokuvien näyttäminen
    function displayMovies(movieData) {
        if (movieData.length === 0) {
            movieContainer.innerHTML = "<p>Ei näytöksiä saatavilla valitulle teatterille</p>";
            return;
        }
        
        movieContainer.innerHTML = "";
        
        // Poistetaan useat esiintymät elokuvista
        const uniqueMovies = new Map();
        
        Array.from(movieData).forEach(movie => {
            const title = movie.getElementsByTagName("Title")[0].textContent;
            const eventId = movie.getElementsByTagName("EventID")[0].textContent;
            
            // Tallennetaan vain seuraava näytös
            if (!uniqueMovies.has(eventId)) {
                uniqueMovies.set(eventId, movie);
            }
        });
        
        // Näytetään elokuva kerran ja vain seuraava näytös
        uniqueMovies.forEach(movie => {
            const title = movie.getElementsByTagName("Title")[0].textContent;
            const imageUrl = movie.getElementsByTagName("EventLargeImagePortrait")[0]?.textContent || "";
            const showtime = movie.getElementsByTagName("dttmShowStart")[0].textContent;
            const rating = movie.getElementsByTagName("Rating")[0]?.textContent || "Ei ikärajaa";
            const lengthInMinutes = movie.getElementsByTagName("LengthInMinutes")[0]?.textContent || "";
            
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            movieCard.innerHTML = `
                <img src="${imageUrl}" alt="${title}" onerror="this.src='placeholder.png'">
                <h3>${title}</h3>
                <p>Ikäraja: ${rating}</p>
                ${lengthInMinutes ? `<p>Kesto: ${lengthInMinutes} min</p>` : ''}
                <p>Seuraava näytös: ${formatDateTime(showtime)}</p>
            `;
            
            movieContainer.appendChild(movieCard);
        });
    }
    
    // Päivämäärän muotoilu
    function formatDateTime(dateTimeStr) {
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('fi-FI', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error('Virhe päivämäärän muotoilussa:', e);
            return dateTimeStr;
        }
    }
});