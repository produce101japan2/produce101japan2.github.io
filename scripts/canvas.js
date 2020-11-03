const ICON_WIDTH = 60;
const ICON_PREFIX = "assets/trainees/"
const ICON_DEFAULT_IMAGE = ICON_PREFIX+"emptyrank.png";
const ICON_BORDER = 2;
const ICON_DEFAULT_LINE_COLOR = "#707070";
const ICON_RANK_FONT_SIZE = 8;
const ICON_RANK_FONT_COLOR = "#fff";
const ICON_RANK_BG_COLOR = "#0086ff";
const ICON_RANK_NAME_SIZE = 11;
const PYRAMID_PADDING_X = 50;
const PYRAMID_PADDING_Y = 40;
const CANVAS_SCALE = 2;
const HEADER_HEIGHT = 60;
const HEADER_MARGIN = HEADER_HEIGHT + PYRAMID_PADDING_Y / 2;
const HEADER_COLOR_START = "#40AFFF";
const HEADER_COLOR_END = "#0086ff";
const HEADER_LOGO_IMG = "assets/logo.svg";

const FONT_DEFAULT = "'serif'";
const icon_sample_image = ICON_PREFIX+"001_aokimasanami.png";

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

function drawPicture(ctx, width, height, icons_arr = [1, 2, 3, 5]){
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
  drawString(ctx, getDateString(),  width,  height - 20, 12, "#000","end")

  // border
  processPyramidCell(icons_arr, (row_icons_size, i,j) => {
      ctx.beginPath();
      ctx.arc((width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
              i * (ICON_WIDTH + PYRAMID_PADDING_Y) + ICON_WIDTH / 2 + HEADER_MARGIN,
               ICON_WIDTH / 2 - ICON_BORDER, 0, Math.PI*2);
      ctx.closePath();
      ctx.strokeStyle = ICON_DEFAULT_LINE_COLOR;
      ctx.lineWidth = ICON_BORDER;
      ctx.stroke();
  })

  // draw picture
  processPyramidCell(icons_arr, (row_icons_size, i,j) => {
      const chara = new Image();
      chara.src = ICON_DEFAULT_IMAGE;
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
        let rank_sum = 0;
        for(let k = 0; k < i; k++){
          rank_sum += icons_arr[k];
        }
        ctx.beginPath();
        ctx.arc( (width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                i * (ICON_WIDTH + PYRAMID_PADDING_Y)+ HEADER_MARGIN+ICON_WIDTH -  ICON_RANK_FONT_SIZE/2,
                ICON_RANK_FONT_SIZE / 2 + 1, 0, Math.PI*2);
        ctx.fillStyle = ICON_RANK_BG_COLOR;
        ctx.fill() ;
        ctx.strokeStyle = ICON_RANK_BG_COLOR;
        ctx.lineWidth = 0;
        ctx.stroke();
        drawString(ctx, rank_sum + j + 1,
                   (width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                   i * (ICON_WIDTH + PYRAMID_PADDING_Y)+ HEADER_MARGIN + ICON_WIDTH,
                   ICON_RANK_FONT_SIZE, ICON_RANK_FONT_COLOR, "center")
      };

      // put name
      drawString(ctx, "test日本語",
                 (width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                 (i + 1) * (ICON_WIDTH + PYRAMID_PADDING_Y) + ICON_WIDTH,
                 ICON_RANK_NAME_SIZE, "#000", "center")
  })

  // put rank
}

function createCanvas() {
  var canvas = document.getElementById('ranking__pyramid');
  if (canvas.getContext){
    const ctx = canvas.getContext("2d");
    ctx.scale(CANVAS_SCALE,CANVAS_SCALE);

    drawPicture(ctx, canvas.width / CANVAS_SCALE , canvas.height / CANVAS_SCALE)
  }
}

function download(event){
    let canvas = document.getElementById("ranking__pyramid");

    let link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `p101js2_${new Date().getTime()}.png`;
    link.click();
}


document.getElementById("download").onclick = download