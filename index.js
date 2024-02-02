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

  startsWith(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return true;
  }
}

const trie = new Trie();
let word;

Promise.all([
  fetch("wordTrie.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then((json) => {
      trie.root = json;
    }),

  fetch("words.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then((json) => {
      word = json[Math.floor(Math.random() * json.length)];
    }),
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

let over = false;

//let word = JSON.parse(fs.readFileSync("words.json", "utf8"))[Math.floor(Math.random() * words.length)];

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

//document.onload = setup();

function setup() {
  word = word.toUpperCase();
  console.log(word);
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
        let e = { code: event.target.id };
        //console.log(e);
        processKey(e);
      });
      row.appendChild(key);
    }
    document.getElementById("keyboard").appendChild(row);
  }

  document.getElementById("0-0").classList.add("selected");
  curSelected = document.getElementById("0-0");

  for (let i = 0; i < w; i++) {
    let cell = document.getElementById(r + "-" + i);
    cell.classList.add("currentRow");
  }

  document.addEventListener("keyup", function (e) {
    processKey(e);
  });
}

function processKey(e) {
  if (over) return;
  if ("KeyA" <= e.code && e.code <= "KeyZ") {
    if (c < w) {
      curSelected.innerText = e.code[3].toString().toUpperCase();
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
      if(c<w) {
        curSelected = document.getElementById(r + "-" + c);
        curSelected.classList.remove("selected");
      }
      if(c>0) c--;
      curSelected = document.getElementById(r + "-" + c);
      curSelected.classList.add("selected");
      curSelected.innerText="";
      }
  } else if (e.code == "Enter") {
    if (c != w) return;
    let guess = "";
    for (let i = 0; i < w; i++) {
      curSelected = document.getElementById(r + "-" + i);
      guess += curSelected.innerText;
    }
    guess = guess.toLowerCase();
    console.log(guess);
    console.log(trie.search(guess));
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
    //update();
    update();
    nextRow();
    c = 0;
    if (r < h) {
      curSelected = document.getElementById(r + "-" + c);
      curSelected.classList.add("selected");
    }
    setTimeout(() => {}, 500);
  }

  // console.log(r, c);

  if (!over && r == h) {
    over = true;
    document.getElementById("reveal").style.display = "none";
    document.getElementById("answer").innerText =
      "Answer: " + word + "<br/>Better luck next time.";
    document.getElementById("answer").style.display = "block";
  }
}

function update() {
  let mp = {};
  // let keys=document.getElementsByClassName("key");
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
      //console.log(letter,word[i]);
      //curSelected.classList.add("correct");
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
      // curSelected.classList.add("present");
      state[i] = "p";
      mp[letter]--;
    } else {
      // curSelected.classList.add("wrong");
      state[i] = "w";
    }
  }
  //console.log(state);

  for (let j = 0; j < w; j++) {
    curSelected = document.getElementById(r + "-" + j);
    curSelected.classList.add("flipping");
    let corrKey = document.getElementById("Key" + curSelected.innerText);
    corrKey.classList.add("flipping");
    setTimeout(function () {
      curSelected.classList.remove("flipping");
      corrKey.classList.remove("flipping");
    }, 200);
  }



  for (let i = 0; i < w; i++) {
    curSelected = document.getElementById(r + "-" + i);
    let corrKey = document.getElementById("Key" + curSelected.innerText);
    if (state[i] == "c") {
      curSelected.classList.add("correct");
      corrKey.classList.add("correct");
    } else if (state[i] == "p") {
      curSelected.classList.add("present");
      corrKey.classList.add("present");
    } else if (state[i] == "w") {
      curSelected.classList.add("absent");
      corrKey.classList.add("absent");
    }
  }

  if (correct == w) {
    over = true;
    document.getElementById("keyboard").style.display = "none";
    document.getElementById("reveal").style.display = "none";
    document.getElementById("answer").innerText = "You won! Congratulations!";
    document.getElementById("answer").style.display = "block";
  }
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



// function calculateScore() {

// }

// function showPopUp(msg) {
//   const popUp=document.getElementsByClassName("pop-up");
//   const title= document.getElementsByClassName("pop-up-title");
//   const content=document.getElementsByClassName("pop-up-content");
  
// }


