const CANVAS_SCALE = 2;
const ICON_WIDTH = 60;
const ICON_PREFIX = "assets/trainees/"
const ICON_DEFAULT_IMAGE = ICON_PREFIX+"emptyrank.png";
const ICON_BORDER = 2;
const ICON_DEFAULT_LINE_COLOR = "#707070";
const ICON_LINE_COLOR = {
     a: "#f7abc5",
     b: "#f47f22",
     c: "#f6d12f",
     d: "#42b96d",
     f: "#a6a6a4"
}
const ICON_RANK_FONT_SIZE = 8;
const ICON_RANK_FONT_COLOR = "#fff";
const ICON_RANK_BG_COLOR = "#0086ff";
const ICON_RANK_NAME_SIZE = 11;
const PYRAMID_PADDING_X = 50;
const PYRAMID_PADDING_Y = 40;
const HEADER_HEIGHT = 60;
const HEADER_MARGIN = HEADER_HEIGHT + PYRAMID_PADDING_Y / 2;
const HEADER_COLOR_START = "#40AFFF";
const HEADER_COLOR_END = "#0086ff";
const HEADER_LOGO_IMG = "assets/logo.svg";

const FONT_DEFAULT = "'serif'";

let trainees = []

// Takes in name of csv and populates necessary data in table
function readFromCSV(path, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", path, false);
  rawFile.onreadystatechange = function() {
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
  return trainees = csvArrays.map(function(traineeArray, index) {
    const trainee = {};
    trainee.id = parseInt(traineeArray[0].split('_')[0]); // trainee id is the original ordering of the trainees in the first csv
    trainee.image = traineeArray[0] + ".jpg";
    trainee.name_romanized = traineeArray[1];
    trainee.name_japanese = traineeArray[2];
    trainee.name = traineeArray[2]; // TODO lang
    trainee.rank = traineeArray[4] || 1;
    trainee.eliminated = trainee.rank > currentBorder; // t if eliminated
    trainee.grade = traineeArray[3];
    // unused
    trainee.top11 = false; // sets trainee to top 11 if 't' appears in 6th column
    return trainee;
  });
}

function zeroPadding(num,length){
  return ('0' + num).slice(-length);
}

function drawString(ctx, text, posX, posY, fontSize = 16, textColor = '#000000', align = "start", font = FONT_DEFAULT) {
	ctx.save();
	ctx.font = fontSize + "px " + font;
	ctx.fillStyle = textColor;
  ctx.textAlign = align;
  ctx.fillText(text, posX, posY);
	ctx.restore();
}

function getDateString() {
  var today = new Date();
  return today.getFullYear()
         + "/" + zeroPadding(today.getMonth() + 1, 2)
         + "/" + zeroPadding(today.getDate() , 2)
         + " " + zeroPadding(today.getHours() , 2)
         + ":" + zeroPadding(today.getMinutes(), 2) ;
}

function processPyramidCell(icons_arr, processCell){
  for (let i = 0; i < icons_arr.length; i++) {
    const row_icons_size = icons_arr[i];
    for(let j = 0; j < row_icons_size; j++){
      processCell(row_icons_size, i, j)
    }
  }
}

function drawPicture(ctx, width, height, picks, icons_arr = [1, 2, 3, 5]){
  // background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // header
  const grad = ctx.createLinearGradient(0,0, width, 0);
  grad.addColorStop(0, HEADER_COLOR_START);
  grad.addColorStop(0.5, HEADER_COLOR_END);
  grad.addColorStop(1, HEADER_COLOR_START);
  ctx.rect( 0, 0, width, HEADER_HEIGHT )
  ctx.fillStyle = grad;
  ctx.fill() ;
  drawString(ctx, "PRODUCE 101 JAPAN season2", width / 2, 20 + 5 , 20, "#fff", "center")
  drawString(ctx, "推しMENメーカー", width / 2, 40 + 10, 18, "#f3cdd3", "center")

  // date
  drawString(ctx, 'at '+getDateString(),  width - 5,  height - 20, 12, "#000","end")

  // draw picture
  processPyramidCell(icons_arr, (row_icons_size, i,j) => {
      // current rank
      let rank_sum = 0;
      for(let k = 0; k < i; k++){
        rank_sum += icons_arr[k];
      }
      const rank = rank_sum + j;
      const trainee = picks[rank] !== 'undefined' && picks[rank] != null && typeof trainees[picks[rank]] !== 'undefined'
                     ? trainees[picks[rank]] : null;

      // border
      ctx.beginPath();
      ctx.arc((width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
              i * (ICON_WIDTH + PYRAMID_PADDING_Y) + ICON_WIDTH / 2 + HEADER_MARGIN,
               ICON_WIDTH / 2 - ICON_BORDER, 0, Math.PI*2);
      ctx.closePath();
      ctx.strokeStyle = trainee != null ? ICON_LINE_COLOR[trainee.grade] : ICON_DEFAULT_LINE_COLOR;
      ctx.lineWidth = ICON_BORDER;
      ctx.stroke();

      const chara = new Image();
      chara.src = trainee != null ? ICON_PREFIX + trainees[picks[rank]].image : ICON_DEFAULT_IMAGE

      chara.onload = () => {
        ctx.save();
        ctx.arc((width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                i * (ICON_WIDTH + PYRAMID_PADDING_Y) + ICON_WIDTH / 2+ HEADER_MARGIN,
                 ICON_WIDTH / 2 - ICON_BORDER, 0, Math.PI*2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(chara,
                      (width - ICON_WIDTH  * (row_icons_size) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2 + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                      i * (ICON_WIDTH + PYRAMID_PADDING_Y)+ HEADER_MARGIN,
                      ICON_WIDTH, ICON_WIDTH);
        ctx.restore();

        // put rank
        ctx.beginPath();
        ctx.arc( (width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                i * (ICON_WIDTH + PYRAMID_PADDING_Y)+ HEADER_MARGIN+ICON_WIDTH -  ICON_RANK_FONT_SIZE/2,
                ICON_RANK_FONT_SIZE / 2 + 1, 0, Math.PI*2);
        ctx.fillStyle = ICON_RANK_BG_COLOR;
        ctx.fill() ;
        ctx.strokeStyle = ICON_RANK_BG_COLOR;
        ctx.lineWidth = 0;
        ctx.stroke();
        drawString(ctx, rank + 1,
                   (width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                   i * (ICON_WIDTH + PYRAMID_PADDING_Y)+ HEADER_MARGIN + ICON_WIDTH,
                   ICON_RANK_FONT_SIZE, ICON_RANK_FONT_COLOR, "center")
      };

      // put name
      drawString(ctx,
                 trainee != null ? trainee.name_japanese : "",
                 (width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                 (i + 1) * (ICON_WIDTH + PYRAMID_PADDING_Y) + ICON_WIDTH,
                 ICON_RANK_NAME_SIZE, "#000", "center")
  })
}

function createCanvas(picks = [], isReset = false) {
  var canvas = document.getElementById('ranking__pyramid');
  if (canvas.getContext){
    const ctx = canvas.getContext("2d");
    if ( !isReset ) {
      ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
    }else{
      ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    }
    drawPicture(ctx, canvas.width / CANVAS_SCALE , canvas.height / CANVAS_SCALE, picks)
  }
}

function download(event){
    let canvas = document.getElementById("ranking__pyramid");

    let link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `p101js2_${new Date().getTime()}.png`;
    link.click();
}

function onChangeTrainees(picks){
  createCanvas(picks, true)
}

var currentBorder = 98;
var picks = [0, 1, 2, null, 25]

readFromCSV("./trainee_info.csv?201910121652",
            (t) => {
              trainees = t;
              createCanvas(picks);
            });
document.getElementById("download").onclick = download