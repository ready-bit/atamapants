let bgImg;          // 固定不变的背景图
let userImg;        // 用户上传的图
let fileInput;      // 文件上传按钮
let sizeSlider;     // 尺寸调节滑块
let saveBtn;        // 保存图片按钮

// --- 变量 ---
let userX, userY;   // 用户图片的坐标位置
let isDragging = false; 
let textInput;      // 网页下方的多行输入框

function preload() {
  bgImg = loadImage('bg.png'); 
}

function setup() {
  // 画布大小 3:4 比例 (450 x 600)
  let canvasWidth = 450;
  let canvasHeight = (canvasWidth * 4) / 3; 
  let canvas = createCanvas(canvasWidth, canvasHeight); 
  
  // 初始化用户图片的位置在画布中央
  userX = width / 2;
  userY = height / 2;

  // --------------------------------------------------
  // 🎨 HTML 控件创建与现代 UI 容器化排版 (彻底告别重叠错位)
  // --------------------------------------------------
  
  // 1. 创建一个包裹所有控制组件的全局容器
  let controlContainer = createDiv('');
  controlContainer.style('display', 'flex');
  controlContainer.style('flex-direction', 'column');
  controlContainer.style('align-items', 'center');
  controlContainer.style('gap', '15px');
  controlContainer.style('max-width', '450px');
  controlContainer.style('margin', '0 auto 50px auto');
  controlContainer.style('padding', '0 10px');
  controlContainer.style('box-sizing', 'border-box');

  // 2. 第一排：上传组件 + 尺寸滑块（横向并排）
  let row1 = createDiv('');
  row1.parent(controlContainer);
  row1.style('display', 'flex');
  row1.style('justify-content', 'space-between');
  row1.style('align-items', 'center');
  row1.style('width', '100%');
  row1.style('gap', '10px');

  fileInput = createFileInput(handleFile);
  fileInput.parent(row1);
  fileInput.style('flex', '1');
  
  sizeSlider = createSlider(0.1, 2, 1, 0.01);
  sizeSlider.parent(row1);
  sizeSlider.style('flex', '1');
  sizeSlider.style('height', '6px');
  sizeSlider.style('accent-color', '#3c73b5'); // 滑块主色调

  // 3. 第二排：多行输入框
  textInput = createInput('', 'textarea'); 
  textInput.parent(controlContainer);
  textInput.attribute('placeholder', '请在此处输入文字，长串英文或回车均可正常换行...');
  textInput.attribute('maxlength', '45'); 
  textInput.style('width', '100%');      
  textInput.style('height', '80px');       
  textInput.style('padding', '10px');       
  textInput.style('border', '1px solid #ddd');       
  textInput.style('border-radius', '8px');       
  textInput.style('font-size', '14px');       
  textInput.style('box-sizing', 'border-box');       
  textInput.style('resize', 'none');       
  textInput.style('outline', 'none');       

  // 4. 第三排：大宽幅保存图片按钮
  saveBtn = createButton('保存我的图片');
  saveBtn.parent(controlContainer);
  saveBtn.mousePressed(saveMyCanvas); 
  saveBtn.style('width', '100%');
  saveBtn.style('padding', '12px 0');
  saveBtn.style('background-color', '#3c73b5');
  saveBtn.style('color', '#fff');
  saveBtn.style('border', 'none');
  saveBtn.style('border-radius', '8px');
  saveBtn.style('font-size', '16px');
  saveBtn.style('font-weight', 'bold');
  saveBtn.style('cursor', 'pointer');
  saveBtn.style('box-shadow', '0 4px 6px rgba(60,115,181,0.2)');

  // --- 画布居中处理 ---
  let canvasElement = canvas.canvas;
  canvasElement.style.margin = "20px auto 15px auto";
  canvasElement.style.display = "block";
  canvasElement.style.maxWidth = "100%";
  canvasElement.style.height = "auto"; // 兼容移动端等比缩放

  // 全局背景美化
  select('body').style('background-color', '#f7f9fc');
}

function draw() {
  background(240);

  // 5. 先绘制用户上传的图
  if (userImg) {
    push();
    imageMode(CENTER);
    let scaleFactor = sizeSlider.value();
    let targetWidth = userImg.width * scaleFactor;
    let targetHeight = userImg.height * scaleFactor;
    image(userImg, userX, userY, targetWidth, targetHeight);
    pop();
  }

  // 6. 后绘制固定背景图
  push();
  imageMode(CENTER);
  let bgWidth = width - 50; 
  let bgHeight = (bgWidth * bgImg.height) / bgImg.width; 
  image(bgImg, width / 2, height / 2, bgWidth, bgHeight); 
  pop();
  
  // 7. 文字渲染逻辑
  let txt = textInput.value();
  if (txt) {
    push();
    translate(160, 250); 
    rotate(radians(-40)); 
    textAlign(LEFT, TOP);         
    fill('#3c73b5');              
    textSize(10);                 
    let currentLeading = 10;      
    textLeading(currentLeading);              
    noStroke();
    
    let maxWidth = 110;           
    let maxHeight = 90;           
    let paragraphs = txt.split('\n');
    let yOffset = 0; 
    
    for (let i = 0; i < paragraphs.length; i++) {
      let pText = paragraphs[i];
      if (yOffset >= maxHeight) break;
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

function saveMyCanvas() {
  saveCanvas('my_design', 'png');
}

// ==========================================
// 💻 电脑端：鼠标交互逻辑
// ==========================================
function mousePressed() {
  if (matchMedia('(pointer: coarse)').matches) return;

  if (userImg) {
    let scaleFactor = sizeSlider.value();
    let targetWidth = userImg.width * scaleFactor;
    let targetHeight = userImg.height * scaleFactor;
    if (mouseX > userX - targetWidth / 2 && mouseX < userX + targetWidth / 2 &&
        mouseY > userY - targetHeight / 2 && mouseY < userY + targetHeight / 2) {
      isDragging = true;
    }
  }
}

function mouseDragged() {
  if (matchMedia('(pointer: coarse)').matches) return;
  if (isDragging) {
    userX = mouseX;
    userY = mouseY;
  }
}

function mouseReleased() {
  if (matchMedia('(pointer: coarse)').matches) return;
  isDragging = false;
}

function handleFile(file) {
  if (file.type === 'image') {
    userImg = createImg(file.data, '', '', () => {
      userImg.hide(); 
    });
    userX = width / 2;
    userY = height / 2;
  } else {
    alert('请选择图片文件！');
    userImg = null;
  }
}

// ==========================================
// 📱 手机端：触摸拖拽兼容逻辑 (终极解脱锁死版)
// ==========================================
function touchStarted() {
  if (userImg && touches && touches.length > 0) {
    let scaleFactor = sizeSlider.value();
    let targetWidth = userImg.width * scaleFactor;
    let targetHeight = userImg.height * scaleFactor;
    
    let tX = touches[0].x;
    let tY = touches[0].y;
    
    // 严格判定：只有当手指真正摸到画布中的图片时，才开启拖拽状态
    if (tX > userX - targetWidth / 2 && tX < userX + targetWidth / 2 &&
        tY > userY - targetHeight / 2 && tY < userY + targetHeight / 2) {
      isDragging = true;
      return false; // 仅在此刻拦截浏览器手势
    }
  }
  // 如果点击的是画布以外的其他控件，p5.js 不做任何拦截，把触控完全还给原生 HTML
}

function touchMoved() {
  if (isDragging && touches && touches.length > 0) {
    userX = touches[0].x;
    userY = touches[0].y;
    return false; // 正在拖拽图片时，禁止网页跟着上下滚动
  }
}

function touchEnded() {
  // 无论手指在何处离开屏幕，无条件彻底清空拖拽锁，放行所有原生控件点击
  isDragging = false;
}
