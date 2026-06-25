let bubbleImg;      // 手拿思想气泡.png（叠加层，可拖动/缩放）
let userImg;        // 用户上传的照片（底图，铺满画布）
let fileInput;      // 文件上传按钮
let sizeSlider;     // 气泡图尺寸调节滑块
let saveBtn;        // 保存图片按钮

// --- 变量 ---
let bubbleX, bubbleY;   // 气泡图的坐标位置（中心点）
let isDragging = false;
let textInput;      // 网页下方的多行输入框

// 气泡图在默认（缩放=1）状态下的基准宽度，用于计算文字框跟随气泡缩放/位移
const BASE_BUBBLE_WIDTH = 400;

function preload() {
  bubbleImg = loadImage('手拿思想气泡.png');
}

function setup() {
  // 画布大小 3:4 比例 (450 x 600)
  let canvasWidth = 450;
  let canvasHeight = (canvasWidth * 4) / 3;

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-frame');

  // 初始化气泡图的位置在画布中央
  bubbleX = width / 2;
  bubbleY = height / 2;

  // 1. 创建文件上传控件
  fileInput = createFileInput(handleFile);
  fileInput.parent('upload-slot');

  // 2. 创建滑块（控制气泡图尺寸）
  sizeSlider = createSlider(0.3, 2, 1, 0.01);
  sizeSlider.parent('slider-slot');

  // 3. 创建保存图片按钮
  saveBtn = createButton('冲印带走');
  saveBtn.parent('save-slot');
  saveBtn.mousePressed(saveMyCanvas);

  // 4. 创建网页下方的单行输入框
  textInput = createInput('', 'textarea');
  textInput.parent('text-slot');
  textInput.attribute('placeholder', '此刻脑子里转的那句话…');

  // 严格限制字数
  textInput.attribute('maxlength', '45');
}

function draw() {
  background(240);

  // 5. 先绘制用户上传的照片（底图，铺满整个画布）
  if (userImg) {
    push();
    imageMode(CORNER);
    drawCoverImage(userImg, 0, 0, width, height);
    pop();
  }

  // 当前气泡图缩放比例与尺寸
  let bubbleScale = sizeSlider.value();
  let bubbleWidth = BASE_BUBBLE_WIDTH * bubbleScale;
  let bubbleHeight = (bubbleWidth * bubbleImg.height) / bubbleImg.width;

  // 6. 再绘制气泡图（叠加层，可拖动/缩放，永远在照片上方）
  push();
  imageMode(CENTER);
  image(bubbleImg, bubbleX, bubbleY, bubbleWidth, bubbleHeight);
  pop();

  // 7. 字符级强制拆分换行与回车渲染逻辑（文字跟随气泡图一起移动/缩放）
  let txt = textInput.value();
  if (txt) {
    push();

    // 文字锚点相对于气泡图中心的基准偏移（基于默认缩放=1时的设计稿坐标）
    let baseOffsetX = 160 - width / 2;
    let baseOffsetY = 250 - height / 2;
    let anchorX = bubbleX + baseOffsetX * bubbleScale;
    let anchorY = bubbleY + baseOffsetY * bubbleScale;

    translate(anchorX, anchorY);
    rotate(radians(-40)); // 倾斜角 -40 度

    // 设置文字基本样式（随气泡缩放）
    textAlign(LEFT, TOP);
    fill('#3c73b5');
    textSize(10 * bubbleScale);
    let currentLeading = 10 * bubbleScale;
    textLeading(currentLeading);
    noStroke();

    let maxWidth = 110 * bubbleScale;   // 限制宽度
    let maxHeight = 90 * bubbleScale;   // 限制高度

    // 先按用户的手动回车拆分段落
    let paragraphs = txt.split('\n');
    let yOffset = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      let pText = paragraphs[i];
      if (yOffset >= maxHeight) break;

      // 为了对付不加空格的长串英文，我们将这一段文字强制拆解为单个字符流
      let currentLineText = "";

      for (let j = 0; j < pText.length; j++) {
        let char = pText.charAt(j);
        if (textWidth(currentLineText + char) > maxWidth) {
          text(currentLineText, 0, yOffset);
          yOffset += currentLeading;
          currentLineText = char;

          if (yOffset >= maxHeight) break;
        } else {
          currentLineText += char;
        }
      }

      if (yOffset < maxHeight && currentLineText.length > 0) {
        text(currentLineText, 0, yOffset);
        yOffset += currentLeading;
      }

      if (pText === "") {
        yOffset += currentLeading;
      }
    }

    pop();
  }
}

// 以 cover 方式绘制图片，铺满指定区域并保持比例（多余部分裁剪）
function drawCoverImage(img, x, y, w, h) {
  let imgRatio = img.width / img.height;
  let boxRatio = w / h;
  let sx, sy, sw, sh;

  if (imgRatio > boxRatio) {
    // 图片更宽，裁剪左右
    sh = img.height;
    sw = sh * boxRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    // 图片更高，裁剪上下
    sw = img.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  image(img, x, y, w, h, sx, sy, sw, sh);
}

function saveMyCanvas() {
  saveCanvas('my_design', 'png');
}

// 鼠标交互：拖动气泡图位置
function mousePressed() {
  let bubbleScale = sizeSlider.value();
  let bubbleWidth = BASE_BUBBLE_WIDTH * bubbleScale;
  let bubbleHeight = (bubbleWidth * bubbleImg.height) / bubbleImg.width;

  if (mouseX > bubbleX - bubbleWidth / 2 && mouseX < bubbleX + bubbleWidth / 2 &&
      mouseY > bubbleY - bubbleHeight / 2 && mouseY < bubbleY + bubbleHeight / 2) {
    isDragging = true;
  }
}

function mouseDragged() {
  if (isDragging) {
    bubbleX = mouseX;
    bubbleY = mouseY;
  }
}

function mouseReleased() {
  isDragging = false;
}

function handleFile(file) {
  if (file.type === 'image') {
    userImg = createImg(file.data, '', '', () => {
      userImg.hide();
    });
  } else {
    alert('请选择图片文件！');
    userImg = null;
  }
}
