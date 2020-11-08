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
      updateCanvas(picksToBe);
      element.getElementsByClassName(CHECKED_CLASS)[0].remove();
      return;
    }
  }
  // add
  for (let i = 0; i < PYRAMID_MAX; i++) {
    if (typeof picks[i] === 'undefined' || picks[i] === null) {
      picksToBe[i] = trainee.id;
      updateCanvas(picksToBe);
      element.insertAdjacentHTML("beforeend", CHECKED_IMAGE);
      return;
    }
  }
}

function deleteEntryPick(id){
  const picksToBe = picks.slice(0, picks.length);
  Array.from(document.getElementsByClassName('trainee_picker__container__entry'))
      .forEach(e =>{
        if(e.dataset.id == id){
          if(e.getElementsByClassName(CHECKED_CLASS).length > 0){
            e.getElementsByClassName(CHECKED_CLASS)[0].remove();
          }
        }
      });
}

function renderBox(trainees, picks, sortOrder){
  if(typeof sortOrder === 'undefined'){
    sortOrder = getSortOrder(trainees, "id", false);
  }
  const traineePicker = document.getElementById("trainee_picker__container");
  traineePicker.innerHTML = "";
  sortOrder.forEach(index =>{
    traineePicker.insertAdjacentHTML("beforeend", getTableEntryHTML(trainees[index], picks.includes(trainees[index].id)));
    let insertedEntry = traineePicker.lastChild;
    insertedEntry.addEventListener("click", event => {
      clickEntry(trainees[index], event.currentTarget.getElementsByClassName("trainee_picker__container__entry-icon")[0]);
    });
  });
}

function getTableEntryHTML(trainee, selected) {
  let eliminated = (showEliminated && trainee.eliminated) && "eliminated";
  const tableEntry = `
  <div class="trainee_picker__container__entry ${eliminated}" data-id="${trainee.id}">
    <div class="trainee_picker__container__entry-icon">
      <img class="trainee_picker__container__entry-img" src="assets/trainees/${trainee.image}" />
      <div class="trainee_picker__container__entry-icon-border ${trainee.grade}-rank-border"></div>
      ${
        selected ? CHECKED_IMAGE: ""
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

function getSortOrder(trainees, field, isReverse) {
  return Object.keys(trainees).sort((a, b) => {
      if (trainees[a][field] > trainees[b][field]) {
        return isReverse? -1 : 1;
      } else {
        return isReverse? 1 : -1;
      }
    });
}

function filterMember() {

}

function addEventToTools(trainees){
  document.getElementById("button__sortAZ").onclick =
    () => renderBox(trainees, picks, getSortOrder(trainees, "id", false));
  document.getElementById("button__sort19").onclick =
    () => renderBox(trainees, picks, getSortOrder(trainees, "rank", false));
}