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
  // 保持加载你本地的“bg.png”
  bgImg = loadImage('bg.png'); 
}

function setup() {
  // 画布大小 3:4 比例 (450 x 600)
  let canvasWidth = 450;
  let canvasHeight = (canvasWidth * 4) / 3; 
  
  // 用变量 canvas 接住，以便后续调用底层样式
  let canvas = createCanvas(canvasWidth, canvasHeight); 
  
  // 初始化用户图片的位置在画布中央
  userX = width / 2;
  userY = height / 2;
  
  // 1. 创建文件上传控件
  fileInput = createFileInput(handleFile);
  fileInput.position(10, height + 10); 
  fileInput.style('z-index', '9999'); // 📱 强行置顶，防止手机端被画布图层遮挡点不动
  
  // 2. 创建滑块
  sizeSlider = createSlider(0.1, 2, 1, 0.01);
  sizeSlider.position(150, height + 10);
  sizeSlider.style('width', '150px');
  sizeSlider.style('z-index', '9999'); // 📱 强行置顶

  // 3. 创建保存图片按钮
  saveBtn = createButton('保存我的图片');
  saveBtn.position(320, height + 10);
  saveBtn.mousePressed(saveMyCanvas); 
  saveBtn.style('z-index', '9999'); // 📱 强行置顶

  // 4. 创建网页下方的多行输入框
  textInput = createInput('', 'textarea'); 
  textInput.position(10, height + 50); 
  textInput.style('width', '430px');      
  textInput.style('height', '80px');       
  textInput.attribute('placeholder', '请在此处输入文字，长串英文或回车均可正常换行...');
  textInput.attribute('maxlength', '45'); 
  textInput.style('z-index', '9999'); // 📱 强行置顶

  // --- 让画布在网页中水平居中并美化背景 ---
  let canvasElement = canvas.canvas;
  canvasElement.style.margin = "20px auto";
  canvasElement.style.display = "block";
  canvasElement.style.position = "relative";
  canvasElement.style.zIndex = "1"; // 🎨 将画布层级设为底层，给原生按钮组件让路

  // 给网页后台换个舒适的浅灰色背景
  select('body').style('background-color', '#f0f0f0');
}

function draw() {
  background(240);

  // 5. 先绘制用户上传的图（在下方）
  if (userImg) {
    push();
    imageMode(CENTER);
    let scaleFactor = sizeSlider.value();
    let targetWidth = userImg.width * scaleFactor;
    let targetHeight = userImg.height * scaleFactor;
    image(userImg, userX, userY, targetWidth, targetHeight);
    pop();
  }

  // 6. 后绘制你固定的图（在上方）
  push();
  imageMode(CENTER);
  let bgWidth = width - 50; 
  let bgHeight = (bgWidth * bgImg.height) / bgImg.width; 
  image(bgImg, width / 2, height / 2, bgWidth, bgHeight); 
  pop();
  
  // 7. 字符级强制拆分换行与回车渲染逻辑
  let txt = textInput.value();
  if (txt) {
    push();
    
    // 定位到蓝色文字框的左上角起点
    translate(160, 250); 
    rotate(radians(-40)); // 倾斜角 -40 度
    
    // 设置文字基本样式
    textAlign(LEFT, TOP);         
    fill('#3c73b5');              
    textSize(10);                 
    let currentLeading = 10;      // 行距
    textLeading(currentLeading);              
    noStroke();
    
    let maxWidth = 110;           // 限制宽度
    let maxHeight = 90;           // 限制高度
    
    // 先按用户的手动回车拆分段落
    let paragraphs = txt.split('\n');
    let yOffset = 0; 
    
    for (let i = 0; i < paragraphs.length; i++) {
      let pText = paragraphs[i];
      if (yOffset >= maxHeight) break;
      
      // 强制拆解为单个字符流，防止长英文不换行
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
  
  // 界面操作提示文字
  push();
  fill(100);
  noStroke();
  textSize(12);
  text("滑块调节用户图片尺寸，可在画布上拖动图片", 150, height + 35);
  pop();
}

function saveMyCanvas() {
  saveCanvas('my_design', 'png');
}

// ==========================================
// 💻 电脑端：鼠标交互逻辑 (已完美兼容移动端隔离)
// ==========================================
function mousePressed() {
  // 如果是移动端触屏设备，直接跳过鼠标逻辑，防止冲突卡死
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
// 📱 手机端：触摸拖拽兼容逻辑 (全新稳定版)
// ==========================================
function touchStarted() {
  // 如果有有效的手指触摸且上传了图片
  if (userImg && touches && touches.length > 0) {
    let scaleFactor = sizeSlider.value();
    let targetWidth = userImg.width * scaleFactor;
    let targetHeight = userImg.height * scaleFactor;
    
    let tX = touches[0].x;
    let tY = touches[0].y;
    
    // 判断手指是否落在用户上传的图片范围内
    if (tX > userX - targetWidth / 2 && tX < userX + targetWidth / 2 &&
        tY > userY - targetHeight / 2 && tY < userY + targetHeight / 2) {
      isDragging = true;
      return false; // 只在拖拽图片时阻止手机默认滚动行为
    }
  }
}

function touchMoved() {
  if (isDragging && touches && touches.length > 0) {
    // 让图片中心坐标精准跟随手指的滑动
    userX = touches[0].x;
    userY = touches[0].y;
    return false; // 拖拽期间禁止页面滚动
  }
}

function touchEnded() {
  isDragging = false;
}
