//select movie poster original image
let moviePosterImg = document.querySelector('.movie-poster-container img');

//select modal window layer
let modal = document.querySelector('#myModal');

//select close btn
let closeBtn = document.querySelector('.closeBtn');

//select modal window image
let modalImage = document.querySelector('.movie-poster-modal');

moviePosterImg.addEventListener('click', () => {
    modal.style.display = 'block';
    modalImage.src = moviePosterImg.src;
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
})

window.addEventListener('click', (event) => {
    if(event.target === modal) {
        modal.style.display = 'none';
    }
})