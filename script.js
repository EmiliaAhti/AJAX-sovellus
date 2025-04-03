document.addEventListener('DOMContentLoaded', () => {
    const theaterSelect = document.getElementById('theaterSelect');

    fetch('https://www.finnkino.fi/xml/Theatres/')
        .then(response => response.text())
        .then(xmlText => {
            console.log("Saatiin XML-data:", xmlText);
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "text/xml");
            displayTheaters(xml.getElementsByTagName("TheatreArea"));
        })
        .catch(error => {
            console.error('Virhe haettaessa teatteritietoja:', error);
        });

    function displayTheaters(theaterData) {
        theaterSelect.innerHTML = "<option value=''>Valitse teatteri</option>";
        
        for (let theater of theaterData) {
            let id = theater.getElementsByTagName("ID")[0].textContent;
            let name = theater.getElementsByTagName("Name")[0].textContent;
            theaterSelect.innerHTML += `<option value="${id}">${name}</option>`;
        }
    }
});

document.getElementById('theaterSelect').addEventListener('change', () => {
    const theaterId = document.getElementById('theaterSelect').value;
    const movieContainer = document.getElementById('movies');

    if (!theaterId) return;

    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`)
        .then(response => response.text())
        .then(xmlText => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "text/xml");
            const movies = xml.getElementsByTagName("Show");

            displayMovies(movies);
        })
        .catch(error => {
            console.error('Virhe haettaessa elokuvia:', error);
        });

    function displayMovies(movieData) {
        movieContainer.innerHTML = "";

        for (let movie of movieData) {
            let title = movie.getElementsByTagName("Title")[0].textContent;
            let imageUrl = movie.getElementsByTagName("EventLargeImagePortrait")[0]?.textContent || "";
            let showtime = movie.getElementsByTagName("dttmShowStart")[0].textContent;

            movieContainer.innerHTML += `
                <div class="movie-card">
                    <img src="${imageUrl}" alt="${title}">
                    <h3>${title}</h3>
                    <p>Seuraava näytös: ${new Date(showtime).toLocaleString()}</p>
                </div>
            `;
        }
    }
});
