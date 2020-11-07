let showEliminated = false;
let showTop11 = false;

const CHECKED_CLASS = "trainee_picker__container__entry-check";
const CHECKED_IMAGE = `<img class="${CHECKED_CLASS}" src="assets/check.png"/>`;

function clickEntry(trainee, element) {
  const picksToBe = picks.slice(0, picks.length);
  // delete if included
  for (let i = 0; i < PYRAMID_MAX; i++) {
    if (picks[i] === trainee.id) {
      picksToBe[i] = null;
      trainee.selected = false;
      updateCanvas(picksToBe);
      element.getElementsByClassName(CHECKED_CLASS)[0].remove();
      return;
    }
  }
  // add
  for (let i = 0; i < PYRAMID_MAX; i++) {
    if (typeof picks[i] === 'undefined' || picks[i] === null) {
      picksToBe[i] = trainee.id;
      trainee.selected = true;
      updateCanvas(picksToBe);
      element.insertAdjacentHTML("beforeend", CHECKED_IMAGE);
      return;
    }
  }
}

function renderBox(trainees, picks){
  const trainee_picker = document.getElementById("trainee_picker__container");
  Object.keys(trainees).forEach(index =>{
    trainee_picker.insertAdjacentHTML("beforeend", getTableEntryHTML(trainees[index]));
    let insertedEntry = trainee_picker.lastChild;
    insertedEntry.addEventListener("click", event => {
      clickEntry(trainees[index], event.currentTarget.getElementsByClassName("trainee_picker__container__entry-icon")[0]);
    });
  });
}

function getTableEntryHTML(trainee) {
  let eliminated = (showEliminated && trainee.eliminated) && "eliminated";
  const tableEntry = `
  <div class="trainee_picker__container__entry ${eliminated}">
    <div class="trainee_picker__container__entry-icon">
      <img class="trainee_picker__container__entry-img" src="assets/trainees/${trainee.image}" />
      <div class="trainee_picker__container__entry-icon-border ${trainee.grade}-rank-border"></div>
      ${
        trainee.selected ? CHECKED_IMAGE: ""
      }
    </div>
    <div class="trainee_picker__container__entry-text">
      <span class="rank">${trainee.rank}</span>
      <span class="name"><strong>${trainee.name}</strong></span>
      <span class="name sub">(${trainee.name_sub})</span>
    </div>
  </div>`;
  return tableEntry;
}
