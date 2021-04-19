const MEMBER_FILE = "trainee_info.csv?202104152357";
const CURRENT_BORDER = 60;
const CURRENT_RANK_COLUMN = 12;

let targetTop;
let isJapanese = false;
let trainees = [];
let attendees;
let history;

const shuffle = ([...array]) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function readFromCSV(path, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", path, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status === 0) {
        let allText = rawFile.responseText;
        let out = CSV.parse(allText);
        let trainees = convertCSVArrayToTraineeData(out);
        callback(trainees);
      }
    }
  };
  rawFile.send(null);
}

function convertCSVArrayToTraineeData(csvArrays) {
  const trainees = {};
  csvArrays.forEach(traineeArray => {
    const trainee = {};
    trainee.id = parseInt(traineeArray[0].split('_')[0]) - 1;
    trainee.image = traineeArray[0] + ".jpg";
    trainee.image_large = traineeArray[0] + "_1.jpg";
    trainee.name = isJapanese ? traineeArray[1] : traineeArray[2];
    trainee.name_sub = isJapanese ? traineeArray[2] : traineeArray[1];
    trainee.rank = traineeArray[CURRENT_RANK_COLUMN] || 1;
    trainee.eliminated = trainee.rank > CURRENT_BORDER; // t if eliminated
    trainee.grade = traineeArray[10];
    trainee.birth = traineeArray[3];
    trainee.blood = traineeArray[4];
    trainee.height = traineeArray[5];
    trainee.weight = traineeArray[6];
    trainee.birthplace = traineeArray[7];
    trainee.hobby = traineeArray[8];
    trainee.skills = traineeArray[9];
    trainee.compare = 0;
    trainee.score = 0;
    trainees[trainee.id] = trainee;
  });
  return trainees;
}

function getCache(l, r) {
  return history[getMatchKey(l, r)];
}

function setCache(l, r, w) {
  return history[getMatchKey(l, r)] = w;
}

function getMatchKey(l, r) {
  return l <= r ? `${l},${r}` : `${r},${l}`;
}

function getNextMatch(attendees, top) {
  // sort numbers
  // or return match to check
  const sortedNumbers = [];
  let roundAttendees = attendees.slice(0, attendees.length);
  let unfixedAttendees = attendees.slice(0, attendees.length);
  for (let k = 0; k < top; k++) {
    for (let j = 0; j < 100; j++) {
      const nextAttendees = [];
      for (let i = 0; i < (roundAttendees.length - roundAttendees.length % 2) / 2; i++) {
        const left = trainees[roundAttendees[i * 2]].id;
        const right = trainees[roundAttendees[i * 2 + 1]].id;
        const cache = getCache(left, right);
        if (typeof cache === "undefined") {
          return {
            require: {
              l: left,
              r: right
            }
          }
        }
        nextAttendees.push(cache);
      }
      if (roundAttendees.length % 2 !== 0) {
        nextAttendees.push(roundAttendees[roundAttendees.length - 1])
      }
      if (nextAttendees.length === 1) {
        sortedNumbers.push(nextAttendees[0]);
        unfixedAttendees = unfixedAttendees.filter(e => e !== nextAttendees[0]);
        roundAttendees = unfixedAttendees;
        break;
      } else {
        roundAttendees = nextAttendees;
      }
    }
    if (unfixedAttendees.length === 1) {
      sortedNumbers.push(unfixedAttendees[0])
      break;
    }
  }
  return {
    require: null,
    result: sortedNumbers
  };
}

function startCompetition(pool, top) {
  attendees = [];
  history = {};
  targetTop = top;
  for (let i = 0; i < Object.keys(trainees).length; i++) {
    if (trainees[i].rank <= pool) {
      attendees.push(trainees[i].id)
    }
  }
}

function setLang() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("lang")) {
    isJapanese = urlParams.get("lang") === "ja"
  } else {
    isJapanese =
        (window.navigator.userLanguage || window.navigator.language || window.navigator.browserLanguage).substr(
            0, 2) === "ja";
  }

  if (isJapanese) {
    document.documentElement.lang = "ja";
  }
}

function renderMatch(id, me, other) {
  const trainee = trainees[me];
  document.getElementById(id).onclick = "";
  document.getElementById(id).innerHTML =
      `<div class="image_large"><img src="assets/trainees_1/${trainee.image_large}" /></div>`
      +`<div class="name">${trainee.name}</div>`
      + `<div class="birth">${trainee.birth}</div>`
      + `<div class="birthplace">${trainee.birthplace}</div>`
      + `<div class="heightWeight">${trainee.height}cm / ${trainee.weight}kg</div>`
      + `<div class="hobby">${trainee.hobby}</div>`
      + `<div class="skills">${trainee.skills}</div>`;
  document.getElementById(id).onclick =
      () => {
        setCache(me, other, me);
        renderNextMatch();
      };
}

function renderResetMatch() {
  document.getElementById("target-boards-left").onclick = "";
  document.getElementById("target-boards-right").onclick = "";
  document.getElementById("target-boards-left").innerText = "";
  document.getElementById("target-boards-right").innerText = "";
}

function renderNextMatch() {
  const nextMatch = getNextMatch(attendees, targetTop);
  if (nextMatch.require == null) {
    renderResult(nextMatch.result);
    renderResetMatch();
  } else {
    document.getElementById("target-rounds").innerText = Object.keys(history).length + 1;
    renderMatch("target-boards-left", nextMatch.require.l, nextMatch.require.r);
    renderMatch("target-boards-right", nextMatch.require.r, nextMatch.require.l);
  }
}

function renderResult(finalRanking) {
  const htmlArray = [];
  console.log(finalRanking);
  for (let i = 0; i < finalRanking.length; i++) {
    const trainee = trainees[finalRanking[i]];
    htmlArray.push(
        `<div class="ranking__rank">${i + 1}</div>`
        +
        `<div class="ranking__image"><img src="assets/trainees/${trainee.image}" alt="${trainee.name}"/></div>`
        + `<div class="ranking" id="ranking__${i}">${trainee.id} ${trainee.name}</div>`
    );
  }

  document.getElementById("target-boards-result").innerHTML = htmlArray.join("");
  document.getElementById("controller").className = "selected";
}

function renderMatching() {
  document.getElementById("target-boards-result").innerText = "";
  document.getElementById("controller").className = "matching";
}

function updateEstimate() {
  const target = document.getElementsByClassName("target-estimated");
  const estimated = getEstimateRank(Number(document.getElementById("rank-pool").value),
                                    Number(document.getElementById("rank-target").value));
  for (let i = 0; i < target.length; i++) {
    target[i].innerText = estimated;
  }
}

setLang();

readFromCSV(MEMBER_FILE,
            (t) => {
              trainees = t;
            });

updateEstimate(Number(document.getElementById("rank-pool").value),
               Number(document.getElementById("rank-target").value));

document.getElementById("startCompetition").onclick =
    () => {
      renderMatching();
      startCompetition(Number(document.getElementById("rank-pool").value),
                       Number(document.getElementById("rank-target").value));
      renderNextMatch();
    };

document.getElementById("rank-pool").onchange =
    () => {
      updateEstimate();
    };
document.getElementById("rank-target").onchange =
    () => {
      updateEstimate();
    };
