let boardContainer = document.querySelector(`.board`);
let flagsCounterNode = document.querySelector(`.remaining-text`);
let finishButton = document.querySelector(`.finish`);
let timerNode = document.querySelector(`.timer-text`);

for(let i = 0; i < 81; i++){
    boardContainer.innerHTML += `<div class="box animate__animated" id="box-r${Math.floor(i / 9)}c${i % 9}"><p class="box-text d-none"></p></div>`
}
// -3 - mine, -2 -  not initialized, -1 - free.
let gameBoard = [];
for (let i = 0; i < 9; i++) { gameBoard[i] = [-2, -2, -2, -2, -2, -2, -2, -2, -2] };

let board = new Array(boardContainer.querySelectorAll(`.box`));
let initialized = false;
let minesCounter = 0;
let flagsCounter = 0;
let flags = [];
let gameover = false;
let gamewin = false;
let timer = 0;
let timerInterval = null;


let audioTestEl = document.createElement('audio');
audioTestEl.classList.add(`d-none`);
const audioTest = !!(audioTestEl.canPlayType && audioTestEl.canPlayType('audio/mp3;').replace(/no/, ''));

function playSfx(name){
    new Audio(`audio/${name}.mp3`).play();
}


function dirValidation(x1, y1){
    return (x1 > 0) && (x1 < 9) && (y1 > 0) && (y1 < 9);
}

function createNumbers(){
    for(let x = 0; x < 9; x++){
        for(let y = 0; y < 9; y++){
            let box = gameBoard[x][y];
            if (box > -3){
                let c = 0;
                for(let x1 = (x > 0 ? x - 1 : 0); x1 < (x < 8 ? x + 2 : 9); x1++){
                    for(let y1 = (y > 0 ? y - 1 : 0); y1 < (y < 8 ? y + 2 : 9); y1++){
                        if(gameBoard[x1][y1] == -3){
                            c += 1;
                        }
                    }
                }
                if(box == -1){
                    let tmpBox = document.querySelector(`#box-r${x}c${y}`);
                    let tmp = tmpBox.querySelector(`.box-text`);
                    tmp.innerHTML = c;
                    tmp.classList.remove(`d-none`);
                }
                gameBoard[x][y] = c;
            }
        }
    }
}

function timerStart(){
    timerInterval = setInterval(function(){
        if (timer < 5999) timer++;
        timerNode.innerHTML = `${timerFormat(Math.floor(timer/60))}:${timerFormat(timer % 60)}`;
    }, 1000);
}

function timerFormat(t){
    let s = t.toString();
    if(s.length < 2) s = "0" + s;
    return s
}

function timerStop(){
    clearInterval(timerInterval);
}

boardContainer.addEventListener(`click`, evt => {
    let box = evt.target.closest(`.box`);
    let boxR = Number(box.id[5]);
    let boxC = Number(box.id[7]);
    if(!initialized){
        initialized = true;
        box.classList.add("box-open");
        gameBoard[boxR][boxC] = -1;

        let openCount = Math.floor((Math.random() * 4) + 4);
        let openedList = [[boxR, boxC]];
        while (openCount > 0) {
            let startingBox = openedList[Math.floor(Math.random()*openedList.length)];
            let x1 = startingBox[0] + (((Math.random() < 0.5) ? 1 : -1) * Number((Math.random() < 0.5)));
            let y1 = startingBox[1] + (((Math.random() < 0.5) ? 1 : -1) * Number((Math.random() < 0.5)));;
            if (Math.abs(startingBox[0] - x1) == Math.abs(startingBox[1] - y1)) continue;
            if (dirValidation(x1, y1) && !openedList.find(crds => crds[0] == x1 && crds[1] == y1)) {
                openCount--;
                openedList[openedList.length] = [x1, y1];
                gameBoard[x1][y1] = -1;
                document.getElementById(`box-r${x1}c${y1}`).classList.add("box-open");
            }
        }
        // Creating mines
        let minesCount = Math.floor((Math.random() * 8) + 8);
        minesCounter = +minesCount;
        flagsCounter = +minesCount;
        flagsCounterNode.innerHTML = flagsCounter;
        while (minesCount > 0) {
            let x1 = Math.floor(Math.random() * 8);
            let y1 = Math.floor(Math.random() * 8);
            if (gameBoard[x1][y1] == -2){
                minesCount--;
                gameBoard[x1][y1] = -3;
            }
        }

        // Creating Numbers

        createNumbers();

        timerStart();

        if(audioTest) playSfx(`open`);
        
    } else {
        if(!gameover && !gamewin && !flags.find(tst => tst[0] == boxR && tst[1] == boxC)){
            if(box.classList.contains(`box-open`)) return;
            if(gameBoard[boxR][boxC] == -3){
                gameover = true;
                box.classList.add("box-exploded");
                box.innerHTML = `<img class="box-img" src="assets/mine.png">`;

                box.classList.add(`animate__heartBeat`);
                setTimeout(() => box.classList.remove(`animate__heartBeat`), 1000);
                finishButton.value = `Начать сначала?`;

                timerStop();

                if(audioTest) playSfx(`explode`);
            } else {
                box.classList.add("box-open");
                let p = box.querySelector(`.box-text`);

                p.innerHTML = gameBoard[boxR][boxC];
                p.classList.remove(`d-none`);

                if(audioTest) playSfx(`open`);
            }
        }
    }
});

boardContainer.addEventListener(`contextmenu`, evt => {
    evt.preventDefault();
    if(!initialized || gamewin || gameover) return;
    console.log(1);
    let box = evt.target.closest(`.box`);
    let boxR = Number(box.id[5]);
    let boxC = Number(box.id[7]);

    if (box.classList.contains(`box-open`)) return;

    let found = flags.find(tst => tst[0] == boxR && tst[1] == boxC);
    if (!found) {
        if (flagsCounter == 0) return;
        flags[flags.length] = [boxR, boxC];
        box.innerHTML += `<img class="box-img" src="assets/flag.png">`;
        flagsCounter--;
        flagsCounterNode.innerHTML = flagsCounter;

        if(gameBoard[boxR][boxC] == -3) minesCounter--;

        if(audioTest) playSfx(`flag`);
    } else {
        flags.splice(flags.indexOf(found), 1);
        box.querySelector(`.box-img`).remove();
        flagsCounter++;

        if(gameBoard[boxR][boxC] == -3) minesCounter++;

        flagsCounterNode.innerHTML = flagsCounter;
        if(audioTest) playSfx(`flag`);
    }
});

finishButton.addEventListener(`click`, () => {
    if (gamewin || gameover) return window.location.reload();
    if (!initialized) return;
    board.forEach(boxRow => {
        boxRow.forEach(box => {
            let boxR = Number(box.id[5]);
            let boxC = Number(box.id[7]);
            let boxinfo = gameBoard[boxR][boxC];
    
            if (boxinfo == -3){
                if(flags.find(tst => tst[0] == boxR && tst[1] == boxC)){
                    box.classList.add(`box-neutralized`);
                } else {
                    box.innerHTML = `<img class="box-img" src="assets/mine.png">`;
                    box.classList.add(`box-exploded`);
                    box.classList.add(`animate__heartBeat`);
                    setTimeout(() => box.classList.remove(`animate__heartBeat`), 1000);
                }
            } else {
                box.classList.add(`box-open`);
                let p = box.querySelector(`.box-text`);
                p.classList.remove(`d-none`);
                p.innerHTML = boxinfo;
            }
        });
    });

    if(audioTest){
        if (minesCounter == 0){
            playSfx(`win`);
        } else {
            playSfx(`explode`);
        }
    }
    gamewin = true;
    timerStop();
    finishButton.value = `Начать сначала?`;
});

// Rules modal

let rulesNode = document.querySelector(`.rules-modal`);
let rulesClick = document.querySelector(`#rules-click`);
document.addEventListener(`click`, evt => {
    if(!rulesNode.classList.contains(`d-none`) && evt.target.id != `rules-click`){
        rulesNode.classList.add(`d-none`);
    }
});

rulesClick.addEventListener(`click`, () => {
    rulesNode.classList.remove(`d-none`);
});