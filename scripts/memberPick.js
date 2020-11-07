let showEliminated = false;
let showTop11 = false;

function clickEntry(trainee) {
  const picksToBe = picks.slice(0, picks.length);
  for (let i = 0; i < PYRAMID_MAX; i++) {
   if(picks[i] === trainee.id){
      picksToBe[i] = null;
      trainee.selected = false;
      updateCanvas(picksToBe);
      return;
   }
  }
  for (let i = 0; i < PYRAMID_MAX; i++) {
    if (typeof picks[i] === 'undefined' || picks[i] === null) {
      picksToBe[i] = trainee.id;
      trainee.selected = true;
      updateCanvas(picksToBe);
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
      clickEntry(trainees[index]);
    });
  });
}

function getTableEntryHTML(trainee) {
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
      <span class="name"><strong>${trainee.name}</strong></span>
      <span class="name sub">(${trainee.name_sub})</span>
    </div>
  </div>`;
  return tableEntry;
}
