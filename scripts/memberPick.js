let showEliminated = false;
let showTop11 = false;
let isJapanese = false;

function addRankedTrainee(trainee) {
  for (let i = 0; i < picks.length; i++) {
    if (picks[i] === -1) { // if spot is blank denoted by -1 id
      picks[i] = trainee;
      return true;
    }
  }
  return false;
}

function removeRankedTrainee(trainee) {
  for (let i = 0; i < picks.length; i++) {
    if (picks[i] === trainee.id) { // if trainee's match
      picks[i] = newTrainee();
      return true;
    }
  }
  return false;
}

function tableClicked(trainee) {
  const picksToBe = picks.slice(0, picks.length);
  for (let i = 0; i < PYRAMID_MAX; i++) {
    if (typeof picks[i] === 'undefined' || picks[i] === null) {
      picksToBe[i] = trainee.id;
      trainee.selected = true;
      break;
    }else if(picks[i] === trainee.id){
      picksToBe[i] = null;
      trainee.selected = false;
      break;
    }
  }
  console.log(picksToBe);
  updateCanvas(picksToBe);
}

function renderBox(trainees, picks){
  const trainee_picker = document.getElementById("trainee_picker__container");
  for (let i = 0; i < trainees.length; i++) {
    trainee_picker.insertAdjacentHTML("beforeend", populateTableEntry(trainees[i]));
    let insertedEntry = trainee_picker.lastChild;
    insertedEntry.addEventListener("click", function (event) {
      tableClicked(trainees[i]);
    });
  }
}

function populateTableEntry(trainee) {
  // eliminated will have value "eliminated" only if trainee is eliminated and showEliminated is true, otherwise this is ""
  let eliminated = (showEliminated && trainee.eliminated) && "eliminated";
  let top11 = (showTop11 && trainee.top11) && "top11";
  const tableEntry = `
  <div class="table__entry ${eliminated}">
    <div class="table__entry-icon">
      <img class="table__entry-img" src="assets/trainees/${trainee.image}" />
      <div class="table__entry-icon-border ${trainee.grade}-rank-border"></div>
      ${
        top11 ? '<div class="table__entry-icon-crown"></div>' : ''
      }
      ${
        trainee.selected ? '<img class="table__entry-check" src="assets/check.png"/>' : ""
      }
    </div>
    <div class="table__entry-text">
      <span class="rank">${trainee.rank}</span>
      <span class="name"><strong>${isJapanese?trainee.name_japanese:trainee.name_romanized}</strong></span>
      <span class="hangul">(${isJapanese?trainee.name_romanized:trainee.name_japanese})</span>
    </div>
  </div>`;
  return tableEntry;
}
