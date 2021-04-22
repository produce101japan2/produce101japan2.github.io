const MEMBER_FILE = "trainee_info.csv?202104222132";
const CURRENT_BORDER = 60;
const CURRENT_RANK_COLUMN = 13;
//for maker
const PYRAMID_MAX = 11; // sum of PYRAMID_ROWS
const CODE_PARAM = "r";
const PARAM_RESULT = "r";
const PARAM_POOL = "p";
const PARAM_TARGET_RANK = "t";
const URL_PREFIX = "https://produce101japan2.github.io/sort.html?r=";
const MAX_TRAINEE = 101;

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
    trainee.image_large = traineeArray[0] + ".jpg";
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
  const m = history.filter(e => e.key === getMatchKey(l, r));
  return m.length > 0 ? m[0].value : null;
}

function setCache(l, r, w) {
  return history.push({
                        key: getMatchKey(l, r),
                        value: w
                      });
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
        if (cache === null) {
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
      const first = roundAttendees.shift();
      roundAttendees.push(first);
    }
    if (unfixedAttendees.length === 1) {
      sortedNumbers.push(unfixedAttendees[0]);
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
  history = [];
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
    document.getElementById("multi-lang").className = "lang-ja";
  } else {
    document.getElementById("multi-lang").className = "lang-en";
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
    document.getElementById("target-rounds").innerText = history.length + 1;
    if (estimateCount !== 0) {
      const progress = Math.floor(history.length * 100 / estimateCount);
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
  document.getElementById("target-boards-result_share_a")
      .setAttribute("href", `/?r=${encodePicks(finalRanking, PYRAMID_MAX)}`);

  const shareUrl = `${URL_PREFIX}${encodePicks(finalRanking, finalRanking.length)}`;
  document.getElementById("target-boards-result_share-url-v").value = shareUrl;
  document.getElementById("target-boards-result_share-twitter_a")
      .setAttribute("href",
                    `https://twitter.com/intent/tweet?text=${shareUrl}&hashtags=推しMENチェッカー,PRODUCE101JAPAN2`);

  document.getElementById("controller").className = "selected";
}

function renderMatching() {
  document.getElementById("controller").className = "matching";
}

function updateEstimate() {
  const poolNum = Number(document.getElementById("rank-pool").value);
  const targetNum = Number(document.getElementById("rank-target").value);
  estimateCount = getEstimateRank(poolNum, targetNum);
  const target = document.getElementsByClassName("target-estimated");
  for (let i = 0; i < target.length; i++) {
    target[i].innerText = estimateCount;
  }

}

function encodePicks(picksArr, len) {
  let code = "";
  for (let j = 0; j < len; j++) {
    const rank = (typeof picksArr[j] === 'undefined' || picksArr[j] == null) ? 0 : picksArr[j] + 1;
    code = code + zeroPadding(rank.toString(32), 2);
  }
  return code;
}

function decodePicks(code) {
  let picksArr = [];
  for (let j = 0; j < MAX_TRAINEE && j * 2 < code.length - 1; j++) {
    console.log("");
    const v = parseInt(code.substr(j * 2, 2), 32);
    if (v === 0) {
      picksArr[j] = null;
    } else {
      picksArr[j] = v - 1;
    }
    console.log(v);
  }
  return picksArr;
}

function zeroPadding(num, length) {
  var tempNum = num;
  for (let i = 0; i < length + 1; i++) {
    tempNum = '0' + tempNum;
  }
  return tempNum.slice(-length);
}

function onClickInitCompetition() {
  const errorNode = document.getElementById("start-competition_error");
  errorNode.classList.remove("setting-error");
  const pool = Number(document.getElementById("rank-pool").value);
  const target = Number(document.getElementById("rank-target").value);
  if (pool >= target) {
    renderMatching();
    startCompetition(Number(document.getElementById("rank-pool").value),
                     Number(document.getElementById("rank-target").value));
    renderNextMatch();
  } else {
    errorNode.classList.add("setting-error");
  }
}

function renderFromParam() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(PARAM_RESULT)) {
    const pResult = urlParams.get(PARAM_RESULT);
    const result = decodePicks(pResult);
    console.log("load result: " + result);
    renderResult(result);
  }
  if (urlParams.has(PARAM_POOL)) {
    document.getElementById("rank-pool").value = urlParams.get(PARAM_POOL);
  }
  if (urlParams.has(PARAM_TARGET_RANK)) {
    document.getElementById("rank-target").value = urlParams.get(PARAM_TARGET_RANK);
  }
}

setLang();

readFromCSV(MEMBER_FILE,
            (t) => {
              trainees = t;
            });

renderFromParam();

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

document.getElementById("target-boards-back").onclick =
    () => {
      history = history.slice(0, history.length - 1);
      renderNextMatch();
    };

document.getElementById("target-boards-result_share-copy").onclick =
    () => {
      const url = document.getElementById("target-boards-result_share-url-v").value;
      const listener = function(e){
        e.clipboardData.setData("text/plain" , url);
        e.preventDefault();
        document.removeEventListener("copy", listener);
      };
      document.addEventListener("copy" , listener);
      document.execCommand("copy");
      alert("URL copied!");
    };
