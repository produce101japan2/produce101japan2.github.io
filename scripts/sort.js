const MEMBER_FILE = "trainee_info.csv?202104152357";
const CURRENT_BORDER = 60;
const CURRENT_RANK_COLUMN = 12;
//for maker
const PYRAMID_MAX = 11; // sum of PYRAMID_ROWS

let targetTop;
let isJapanese = false;
let trainees = [];
let attendees;
let history;
let estimateCount = 0;

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
      attendees.push(trainees[i].id);
    }
  }
  attendees = shuffle(attendees);
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
      `<div class="image_large"><img src="assets/trainees_1/${trainee.image_large}" />`
      + `<div class="profile">`
      + `<div class="rank">${trainee.rank}位</div>`
      + `<div class="name">${trainee.name}</div>`
      + `<div class="name_sub profile_sub">(${trainee.name_sub})</div>`
      + `<div class="birth profile_sub">${trainee.birthplace} ${trainee.birth}</div>`
      + `<div class="heightWeight profile_sub">${trainee.height}cm,${trainee.weight}kg</div>`
      + `<div class="hobby profile_sub">${trainee.hobby}</div>`
      + `<div class="skills profile_sub">${trainee.skills}</div>`
      + `</div></div>`;
  document.getElementById(id).onclick =
      () => {
        setCache(me, other, me);
        renderNextMatch();
      };
}

function renderNextMatch() {
  const nextMatch = getNextMatch(attendees, targetTop);
  if (nextMatch.require == null) {
    renderResult(nextMatch.result);
  } else {
    document.getElementById("target-rounds").innerText = Object.keys(history).length + 1;
    if (estimateCount !== 0) {
      const progress = Math.floor((Object.keys(history).length) * 100 / estimateCount);
      document.getElementById("target-estimated-progress").innerText = `${progress}`;
      document.getElementById("target-estimated-progress-bar").value = progress
    }
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
        `<div class="ranking__trainee">`
        + `<div class="ranking__image">`
        + `<div class="ranking__image-border ${trainee.grade}-rank-border"></div> `
        + `<img src="assets/trainees/${trainee.image}" alt="${trainee.name}"/>`
        + `<div class="ranking__rank">${i + 1}</div>`
        + `</div>`
        + `<div class="ranking__info">`
        + `<div class="ranking__name" id="ranking__${i}">${trainee.name}</div>`
        + `<div class="ranking__name-sub">(${trainee.name_sub})</div>`
        + `</div>`
        + `</div>`
    );
  }

  document.getElementById("target-boards-result_ranking").innerHTML = htmlArray.join("");
  document.getElementById("target-boards-result_share").innerHTML =
      `<a href="/?r=${encodePicks(finalRanking)}">結果を推しMENメーカーで開く<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-box-arrow-up-right">
  <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
  <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
</svg>
</a>`;
  document.getElementById("controller").className = "selected";
}

function renderMatching() {
  document.getElementById("controller").className = "matching";
}

function updateEstimate() {
  const target = document.getElementsByClassName("target-estimated");
  estimateCount = getEstimateRank(Number(document.getElementById("rank-pool").value),
                                  Number(document.getElementById("rank-target").value));
  for (let i = 0; i < target.length; i++) {
    target[i].innerText = estimateCount;
  }

}

function encodePicks(picksArr) {
  let code = "";
  for (let j = 0; j < PYRAMID_MAX; j++) {
    const rank = (typeof picksArr[j] === 'undefined' || picksArr[j] == null) ? 0 : picksArr[j] + 1;
    code = code + zeroPadding(rank.toString(32), 2);
  }
  return code;
}

function zeroPadding(num, length) {
  var tempNum = num;
  for (let i = 0; i < length + 1; i++) {
    tempNum = '0' + tempNum;
  }
  return tempNum.slice(-length);
}

function onClickInitCompetition() {
  renderMatching();
  startCompetition(Number(document.getElementById("rank-pool").value),
                   Number(document.getElementById("rank-target").value));
  renderNextMatch();
}

setLang();

readFromCSV(MEMBER_FILE,
            (t) => {
              trainees = t;
            });

updateEstimate(Number(document.getElementById("rank-pool").value),
               Number(document.getElementById("rank-target").value));

const initCompetitionButton = document.getElementsByClassName("init-competition");
for (let i = 0; i < initCompetitionButton.length; i++) {
  initCompetitionButton[i].onclick = onClickInitCompetition;
}

document.getElementById("rank-pool").onchange =
    () => {
      updateEstimate();
    };
document.getElementById("rank-target").onchange =
    () => {
      updateEstimate();
    };
