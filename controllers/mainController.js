const axios = require('axios');
const http = require('http');

exports.getMainPage = (req, res) => {
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
            poster: posterUrl,
        });
    });
}

exports.getSearchPage = (req, res) => {
    res.render('search', { movieDetails: '' });
}

exports.postSearchPage = (req, res) => {
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
}

exports.postGetMovie = (req, res) => {
    const movieToSearch =
        req.body.queryResult &&
        req.body.queryResult.parameters &&
        req.body.queryResult.parameters.movie
            ? req.body.queryResult.parameters.movie
            : '';

    const reqUrl = encodeURI(
        `http://www.omdbapi.com/?t=${movieToSearch}&apikey=5e64055`
    );
    http.get(
        reqUrl,
        (responseFromAPI) => {
            let completeResponse = '';
            responseFromAPI.on('data', (chunk) => {
                completeResponse += chunk;
            });
            responseFromAPI.on('end', () => {
                const movie = JSON.parse(completeResponse);
                if (!movie || !movie.Title) {
                    return res.json({
                        fulfillmentText:
                            'Sorry, we could not find the movie you are asking for.',
                        source: 'getmovie',
                    });
                }

                let dataToSend = movieToSearch;
                dataToSend = `${movie.Title} was released in the year ${movie.Year}. It is directed by ${movie.Director} and stars ${movie.Actors}.\n Here some glimpse of the plot: ${movie.Plot}.`;

                return res.json({
                    fulfillmentText: dataToSend,
                    source: 'getmovie',
                });
            });
        },
        (error) => {
            return res.json({
                fulfillmentText: 'Could not get results at this time',
                source: 'getmovie',
            });
        }
    );
}