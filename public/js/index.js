let themeButtonNode = document.querySelector(`.header-nmode`);
let sansClickableNode = document.querySelector(`#sans-clickable`);
let sansTextNode = document.querySelector(`#sans-text`);
let sansVoice = new Audio("./assets/sans.mp3");

themeButtonNode.addEventListener(`click`, function(){
    document.querySelector("body").classList.toggle("dark");
});

let sansClickTimeout = null;

sansClickableNode.addEventListener(`click`, function(){
    sansTextNode.innerHTML = "Не трогай скелета!";
    sansVoice.play();
    if (sansClickTimeout) clearTimeout(sansClickTimeout);
    sansClickTimeout = setTimeout(() => {
        sansTextNode.innerHTML = "Здесь должен был быть виджет, но его ещё нет.";
        sansClickTimeout = null;
    }, 2000);
});