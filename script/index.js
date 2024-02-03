class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    //this.root=JSON.parse(fs.readFileSync('words.txt','utf-8'));
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return node.isEnd;
  }

  getRandomWord() {
    let node = this.root;
    let word = '';
    while (true) {
      let childrenKeys = Object.keys(node.children);
      if (childrenKeys.length === 0) {
        return null; // the Trie is empty
      }
      let randomKey = childrenKeys[Math.floor(Math.random() * childrenKeys.length)];
      word += randomKey;
      node = node.children[randomKey];
      if (node.isEnd) {
        return word;
      }
    }
  }
}

const trie = new Trie();
let word;

Promise.all([
  fetch("asset/wordTrie.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then((json) => {
      trie.root = json;
      word=trie.getRandomWord();
    }),

  // fetch("asset/words.json")
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("HTTP error " + response.status);
  //     }
  //     return response.json();
  //   })
  //   .then((json) => {
  //     word = json[Math.floor(Math.random() * json.length)];
  //   }),
])
  .then(() => {
    setup();
  })
  .catch(function (error) {
    console.log("Fetch error" + error);
  });

let w = 5,
  h = 6;
let r = 0,
  c = 0;

const colors = { c: "🟩", p: "🟨", w: "⬜" };
let guessColors = [];

let over = false;

let animating = false;

let curSelected = null;

const revealbtn = document.getElementById("reveal");
revealbtn.addEventListener("click", () => {
  over = true;
  document.getElementById("keyboard").style.display = "none";
  document.getElementById("reveal").style.display = "none";
  document.getElementById("answer").innerHTML =
    "Answer: " + word + "<br/>" + "Better luck next time.";
  document.getElementById("answer").style.display = "block";
});

function setup() {
  word = word.toUpperCase();
  //console.log(word);
  //initialize board

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let cell = document.createElement("span");
      cell.classList.add("cell");
      cell.id = i + "-" + j;
      cell.innerText = "";
      document.getElementById("board").appendChild(cell);
    }
  }

  //initialize keyboard

  const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["↵", "Z", "X", "C", "V", "B", "N", "M", "←"],
  ];

  for (let i = 0; i < keys.length; i++) {
    let row = document.createElement("div");
    row.classList.add("keyboard-row");
    for (let j = 0; j < keys[i].length; j++) {
      let key = document.createElement("span");
      key.classList.add("key");
      key.innerText = keys[i][j];
      if (keys[i][j] == "←") key.id = "Backspace";
      else if (keys[i][j] == "↵") key.id = "Enter";
      else key.id = "Key" + keys[i][j];
      key.classList.add("active");
      key.addEventListener("click", (event) => {
        if (animating) return;
        let e = { code: event.target.id };
        //console.log(e);
        processKey(e);
      });
      row.appendChild(key);
    }
    document.getElementById("keyboard").appendChild(row);
    document.getElementById("reveal").style.display = "block";
  }

  document.getElementById("0-0").classList.add("selected");
  curSelected = document.getElementById("0-0");

  for (let i = 0; i < w; i++) {
    let cell = document.getElementById(r + "-" + i);
    cell.classList.add("currentRow");
  }

  document.addEventListener("keyup", function (e) {
    //console.log(e);
    if (animating) return;
    let id = e.code.toString();
    if (id == "Delete" || id == "ArrowLeft") id = "Backspace";
    const corKey = document.getElementById(id);
    if (corKey != null) {
      corKey.classList.add("pressed");
      setTimeout(function () {
        corKey.classList.remove("pressed");
      }, 200);
    }
    processKey(e);
  });
}

function processKey(e) {
  if (over) return;
  if ("KeyA" <= e.code && e.code <= "KeyZ") {
    if (c < w) {
      curSelected.innerText = e.code[3].toString().toUpperCase();
      curSelected.classList.add("cellpressed");
      let x=curSelected;
      setTimeout(() => {
        x.classList.remove("cellpressed");
      }, 100);
      if (c < w - 1) {
        curSelected.classList.remove("selected");
      }
      c++;
      if (c < w) {
        curSelected = document.getElementById(r + "-" + c);
        curSelected.classList.add("selected");
      }
    }
  } else if (
    e.code == "Backspace" ||
    e.code == "Delete" ||
    e.code == "ArrowLeft"
  ) {
    if (c > 0) {
      if (c < w) {
        curSelected = document.getElementById(r + "-" + c);
        curSelected.classList.remove("selected");
      }
      if (c > 0) c--;
      curSelected = document.getElementById(r + "-" + c);
      curSelected.classList.add("selected");
      curSelected.innerText = "";
      curSelected.classList.add("cellpressed");
      let x=curSelected;
      setTimeout(() => {
        x.classList.remove("cellpressed");
      }, 100);
    }
  } else if (e.code == "Enter") {
    if (c != w) return;
    let guess = "";
    for (let i = 0; i < w; i++) {
      curSelected = document.getElementById(r + "-" + i);
      guess += curSelected.innerText;
    }
    guess = guess.toLowerCase();
    if (!trie.search(guess)) {
      let curRow = document.getElementsByClassName("currentRow");
      curRow[4].classList.remove("selected");
      for (let i = 0; i < curRow.length; i++) {
        curRow[i].classList.add("shaking");
      }
      setTimeout(function () {
        for (let i = 0; i < curRow.length; i++) {
          curRow[i].classList.remove("shaking");
        }
        curRow[4].classList.add("selected");
      }, 200);
      return;
    }
    c--;
    curSelected = document.getElementById(r + "-" + c);
    curSelected.classList.remove("selected");
    update(() => {
      nextRow();
      c = 0;
      if (r < h) {
        curSelected = document.getElementById(r + "-" + c);
        curSelected.classList.add("selected");
      }
    });
  }

  if (!over && r == h) {
    over = true;
    setTimeout(() => {
      document.getElementById("reveal").style.display = "none";
      document.getElementById("answer").innerText = "Answer: " + word;
      document.getElementById("answerText").innerText =
        "Better luck next time!";
      document.getElementById("answer").style.display = "block";
      document.getElementById("answerText").style.display = "block";
    }, (w - 1) * 300 + 250 + 100);
  }
}

function update(callback) {
  let mp = {};
  let state = [5];
  for (let i = 0; i < w; i++) {
    let x = word[i];
    mp[x] = mp[x] ? mp[x] + 1 : 1;
  }
  let correct = 0;
  for (let i = 0; i < w; i++) {
    curSelected = document.getElementById(r + "-" + i);
    let x = curSelected.innerText;
    let letter = x[0];
    if (word[i] == letter) {
      state[i] = "c";
      correct++;
      mp[letter]--;
    }
  }
  for (let i = 0; i < w; i++) {
    if (state[i] == "c") continue;
    curSelected = document.getElementById(r + "-" + i);
    let x = curSelected.innerText;
    let letter = x[0];
    if (word.includes(letter) && mp[letter] > 0) {
      state[i] = "p";
      mp[letter]--;
    } else {
      state[i] = "w";
    }
  }

  let guessList = {};

  state.forEach((e, i) => {
    guessList[i] = colors[e];
  });
  guessColors.push(guessList);

  setSyncAnim(state, correct);
  callback();
}

function nextRow() {
  if (r == h - 1) {
    r++;
    return;
  }
  for (let i = 0; i < w; i++) {
    let cell = document.getElementById(r + "-" + i);
    cell.classList.remove("currentRow");
  }
  r++;
  for (let i = 0; i < w; i++) {
    let cell = document.getElementById(r + "-" + i);
    cell.classList.add("currentRow");
  }
}

function flip(e, f) {
  e.classList.add("flipping");
  f.classList.add("flipping");
  setTimeout(function () {
    e.classList.remove("flipping");
    f.classList.remove("flipping");
  }, 500);
}

function changeolor(e, f, s) {
  f.classList.remove("correct");
  f.classList.remove("present");
  f.classList.remove("absent");
  if (s == "c") {
    e.classList.add("correct");
    f.classList.add("correct");
  } else if (s == "p") {
    e.classList.add("present");
    f.classList.add("present");
  } else if (s == "w") {
    e.classList.add("absent");
    f.classList.add("absent");
  }
}

function setSyncAnim(state, correct) {
  let cells = [],
    keys = [];
  for (let i = 0; i < w; i++) {
    cells.push(document.getElementById(r + "-" + i));
    keys.push(document.getElementById("Key" + cells[i].innerText));
  }
  animating = true;
  setTimeout(() => {
    animating = false;
  }, (w - 1) * 300 + 250 + 100);
  for (let i = 0; i < w; i++) {
    setTimeout(() => {
      flip(cells[i], keys[i]);
    }, i * 300);
    setTimeout(() => {
      changeolor(cells[i], keys[i], state[i]);
    }, i * 300 + 250);
  }
  if (correct == w) {
    over = true;
    setTimeout(() => {
      document.getElementById("keyboard").style.display = "none";
      document.getElementById("reveal").style.display = "none";
      document.getElementById("answer").innerText = "You won! Congratulations!";
      document.getElementById("answerText").innerText = getMessage(
        calculateScore()
      );
      document.getElementById("answer").style.display = "block";
      document.getElementById("answerText").style.display = "block";
    }, (w - 1) * 300 + 250 + 100);
  }
}

function calculateScore() {
  let mp = {};
  for (let i = 0; i < w; i++) {
    let x = word[i];
    mp[x] = mp[x] ? mp[x] + 1 : 1;
  }
  let score = 0;
  let guesses = [];
  for (let i = 0; i < r; i++) {
    let guess = "";
    for (let j = 0; j < w; j++) {
      let cell = document.getElementById(i + "-" + j);
      guess += cell.innerText;
    }
    guesses.push(guess);
  }
  console.log(guesses);
  let tracking = ["u", "u", "u", "u", "u"];
  let oldGuesses = [];
  for (let pos = 0; pos < w; pos++) {
    for (let tries = 0; tries < r; tries++) {
      // If the guessed position is correct
      if (guesses[tries][pos] == word[pos]) {
        // If the guess was not made before
        if (tracking[pos] != "c") {
          tracking[pos] = "c";
          score += 50;
        }
        // if the guessed position was incorrect
      } else {
        // If the guessed position was correct before, deduct 5 points
        if (tracking[pos] == "c") {
          score -= 10;
        } else if (word.includes(guesses[tries][pos])) {
          tracking[pos] = "p";
          //if the letter is a new letter, add 5 points
          if (
            oldGuesses.filter((e) => e == guesses[tries][pos]) <
            mp[guesses[tries][pos]]
          ) {
            score += 10;
            oldGuesses.push(guesses[tries][pos]);
          }
        }
        //if the guess gives no new clues, no points
        else tracking[pos] = "a";
      }
    }
  }
  //Bonus points for guessing early
  if (tracking.filter((e) => e == "c").length == w) score += (h - r) * 50;
  return score;
}

function getMessage(score) {
  let message =
    "Score:" + score + "\nTries: " + guessColors.length + "\nMoves: \n";
  for (let i = 0; i < guessColors.length; i++) {
    for (let j = 0; j < w; j++) {
      message += guessColors[i][j] + " ";
    }
    message += "\n";
  }
  if (score >= 500) message += "You are a wordle legend!";
  else if (score >= 450) message += "You are a wordle master!";
  else if (score >= 400) message += "You are a wordle expert!";
  else if (score >= 350) message += "You are a wordle pro!";
  else if (score >= 300) message += "You are a wordle enthusiast!";
  else if (score >= 250) message += "You are a wordle beginner!";
  else message += "You are a wordle noob!";
  return message;
}
