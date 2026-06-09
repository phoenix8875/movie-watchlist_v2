const API_URL = '/api/movies';

async function fetchMovies() {
    try {
        const response = await fetch(API_URL);
        const movies = await response.json();
        const list = document.getElementById('movieList');
        list.innerHTML = '';
        
        movies.forEach(movie => {
            const li = document.createElement('li');
            
            const textSpan = document.createElement('span');
            textSpan.textContent = movie.title;
            li.appendChild(textSpan);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '❌';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteMovie(movie.id);
            
            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Error fetching movies:', err);
    }
}

async function addMovie() {
    const input = document.getElementById('movieInput');
    const title = input.value.trim();
    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        if (response.ok) {
            input.value = '';
            fetchMovies();
        }
    } catch (err) {
        console.error('Error adding movie:', err);
    }
}

async function deleteMovie(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchMovies();
        }
    } catch (err) {
        console.error('Error deleting movie:', err);
    }
}

fetchMovies();
