const express = require('express');
const axios = require('axios');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    let url =
        'https://api.themoviedb.org/3/movie/807339?api_key=66d9e7e01da7ecd4981ea9123b980bbf';
    axios.get(url).then((response) => {
        let data = response.data;
        let releaseDate = new Date(data.release_date).getUTCFullYear();
        
        let genresToDisplay = '';
        data.genres.forEach((genre) => {
            genresToDisplay = genresToDisplay + `${genre.name}, `;
        });
        let genresUpdated = genresToDisplay.slice(0, -2) + '.';

        let posterUrl = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`;

        let currentYear = new Date().getFullYear();

        res.render('index', {
            dataToRender: data, 
            year: currentYear,
            releaseYear: releaseDate,
            genres: genresUpdated,
            poster: posterUrl
        });
    });
});

app.get('/search', (req, res) => {
    res.render('search', { movieDetails: '' });
});

app.post('/search', (req, res) => {
    let userMovieTitle = req.body.movieTitle;

    let movieUrl = `https://api.themoviedb.org/3/search/movie?query=${userMovieTitle}&api_key=66d9e7e01da7ecd4981ea9123b980bbf`;

    let genresUrl =
        'https://api.themoviedb.org/3/genre/movie/list?api_key=66d9e7e01da7ecd4981ea9123b980bbf&language=en-US';

    let endpoints = [movieUrl, genresUrl];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
        axios.spread((movie, genres) => {
            const [movieRow] = movie.data.results;
            let movieGenreIds = movieRow.genre_ids;
            let movieGenres = genres.data.genres;

            let movieGenresArray = [];

            for (let i = 0; i < movieGenreIds.length; i++) {
                for (let j = 0; j < movieGenres.length; j++) {
                    if (movieGenreIds[i] === movieGenres[j].id) {
                        movieGenresArray.push(movieGenres[j].name);
                    }
                }
            }

            let genresToDisplay = '';
            movieGenresArray.forEach((genre) => {
                genresToDisplay = genresToDisplay + `${genre}, `;
            });
            let genresUpdated = genresToDisplay.slice(0, -2) + '.';

            let movieData = {
                title: movieRow.title,
                year: new Date(movieRow.release_date).getFullYear(),
                genres: genresUpdated,
                overview: movieRow.overview,
                posterUrl: `https://image.tmdb.org/t/p/w500${movieRow.poster_path}`,
            };

            res.render('search', { movieDetails: movieData });
        })
    );
});

app.listen(process.env.PORT || 3000, () => {
    console.log('server is running');
});
