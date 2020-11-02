const ICON_WIDTH = 60;
const ICON_PREFIX = "assets/trainees/"
const ICON_DEFAULT_IMAGE = ICON_PREFIX+"emptyrank.png";
const ICON_BORDER = 2;
const PYRAMID_PADDING_X = 50;
const PYRAMID_PADDING_Y = 40;
const CANVAS_SCALE = 2;
const HEADER_HEIGHT = 30;
const HEADER_MARGIN = HEADER_HEIGHT + PYRAMID_PADDING_Y / 2;
const HEADER_COLOR_START = "#0144FC";
const HEADER_COLOR_END = "#1087FF";
const HEADER_LOGO_IMG = "assets/logo.svg";

const FONT_DEFAULT = "'serif'";
const icon_sample_image = ICON_PREFIX+"001_aokimasanami.png";

const ICON_DEFAULT_LINE_COLOR = "blue";

function zeroPadding(num,length){
  return ('0' + num).slice(-length);
}

function drawString(ctx, text, posX, posY, fontSize = 16, textColor = '#000000', font = FONT_DEFAULT) {
	var lines = text.split("\n");
	ctx.save();
	ctx.font = fontSize + "px " + font;
	ctx.fillStyle = textColor;
	ctx.translate(posX, posY);
	for (i = 0; i < lines.length; i++) {
 		ctx.fillText(lines[i],0, i*fontSize);
	}
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

function putDefaults(ctx, width, height, icons_arr = [1, 2, 3, 5]){
  // header
  const grad = ctx.createLinearGradient(0,0, width, 0); // グラデーションを作成
  grad.addColorStop(0,HEADER_COLOR_START);
  grad.addColorStop(0.5,HEADER_COLOR_END);
  grad.addColorStop(1,HEADER_COLOR_START);
  ctx.rect( 0, 0, width, HEADER_HEIGHT )
  ctx.fillStyle = grad;
  ctx.fill() ;
  drawString(ctx, "PRODUCE 101 JAPAN", 50, 23, 20, "#fff")
  drawString(ctx, "推しMENメーカー", 280, 23, 18, "#f3cdd3")


  // date
  drawString(ctx, getDateString(),  width - 150,  height - 20, 12)

  // border
  for (let i = 0; i < icons_arr.length; i++) {
    const row_icons_size = icons_arr[i];
    for(let j = 0; j < row_icons_size; j++){
      ctx.beginPath();
      ctx.arc((width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
              i * (ICON_WIDTH + PYRAMID_PADDING_Y) + ICON_WIDTH / 2 + HEADER_MARGIN,
               ICON_WIDTH / 2 - ICON_BORDER, 0, Math.PI*2);
      ctx.closePath();
      ctx.strokeStyle = ICON_DEFAULT_LINE_COLOR;
      ctx.lineWidth = ICON_BORDER ;
      ctx.stroke();
    }
  }

  // draw picture
  for (let i = 0; i < icons_arr.length; i++) {
    const row_icons_size = icons_arr[i];
    for(let j = 0; j < row_icons_size; j++){
      ctx.arc((width - ICON_WIDTH  * (row_icons_size - 1) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2  + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
              i * (ICON_WIDTH + PYRAMID_PADDING_Y) + ICON_WIDTH / 2+ HEADER_MARGIN,
               ICON_WIDTH / 2 - ICON_BORDER, 0, Math.PI*2);
      ctx.closePath();
    }
  }
  ctx.clip();

  for (let i = 0; i < icons_arr.length; i++) {
    const row_icons_size = icons_arr[i];
    for(let j = 0; j < row_icons_size; j++){
      const chara = new Image();
      chara.src = ICON_DEFAULT_IMAGE;
      chara.onload = () => {
        ctx.drawImage(chara,
                      (width - ICON_WIDTH  * (row_icons_size) - PYRAMID_PADDING_X * (row_icons_size - 1)) / 2 + ICON_WIDTH * j + PYRAMID_PADDING_X * j,
                      i * (ICON_WIDTH + PYRAMID_PADDING_Y)+ HEADER_MARGIN,
                      ICON_WIDTH, ICON_WIDTH);
      };
    }
  }
}

function createCanvas() {
  var canvas = document.getElementById('ranking__pyramid');
  if (canvas.getContext){
    const ctx = canvas.getContext("2d");
    ctx.scale(CANVAS_SCALE,CANVAS_SCALE);

    putDefaults(ctx, canvas.width / CANVAS_SCALE , canvas.height / CANVAS_SCALE)
  }
}