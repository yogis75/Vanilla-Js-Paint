var drawingBoard = document.querySelector("#drawingBoard");
var selectTool = document.querySelector(".selectTool");
var svgNS = "http://www.w3.org/2000/svg";
var createLine = document.querySelector("[data-type='line']");
var createRect = document.querySelector("[data-type='rect']");
var createCircle = document.querySelector("[data-type='circle']");
var createEllipse = document.querySelector("[data-type='ellipse']");
var createFreeHand = document.querySelector("[data-type='freeHand']");
var clearCanvas = document.querySelector("[data-type='clearCanvas']");
var strokeSlider = document.querySelector("[data-type='strokeSlider']");
var strokeSliderValue = document.querySelector(
  "[data-type='strokeSliderValue']"
);
var strokeColor = document.querySelector("[data-type='strokeColor']");
var fillColor = document.querySelector("[data-type='fillColor']");

var newElement;
var elementType;
var rectStartX;
var rectStartY;
var drawing = false;
var bRect = drawingBoard.getBoundingClientRect();
var strokeWidth = 2;
var bufferSize;
var strPath;
var buffer = [];

strokeSlider.oninput = function () {
  strokeWidth = this.value;
  strokeSliderValue.innerText = this.value;
};

document.addEventListener("click", function (e) {
  var itemType = e.target.dataset.type;
  switch (itemType) {
    case "line":
      elementType = "line";
      break;
    case "rect":
      elementType = "rect";
      break;
    case "circle":
      elementType = "circle";
      break;
    case "ellipse":
      elementType = "ellipse";
      break;
    case "freeHand":
      elementType = "path";
      break;
    default:
      return;
  }
});

function onMouseDown(event) {
  drawing = true;
  var stroke = strokeColor.value;
  var fill = fillColor.value;
  var x1 = event.clientX - bRect.left;
  var y1 = event.clientY - bRect.top;
  var x2 = event.clientX - bRect.left;
  var y2 = event.clientY - bRect.top;
  rectStartX = Math.abs(x1);
  rectStartY = Math.abs(y1);

  switch (elementType) {
    case "line":
      newElement = document.createElementNS(svgNS, "line");
      newElement.setAttribute("x1", x1);
      newElement.setAttribute("y1", y1);
      newElement.setAttribute("x2", x2);
      newElement.setAttribute("y2", y2);
      newElement.setAttribute("stroke", stroke);
      newElement.setAttribute("stroke-width", strokeWidth);
      break;
    case "rect":
      newElement = document.createElementNS(svgNS, "rect");
      newElement.setAttribute("stroke", stroke);
      newElement.setAttribute("fill", fill);
      newElement.setAttribute("stroke-width", strokeWidth);
      newElement.setAttribute("x", rectStartX);
      newElement.setAttribute("y", rectStartY);
      break;
    case "ellipse":
      newElement = document.createElementNS(svgNS, "ellipse");
      newElement.setAttribute("stroke", stroke);
      newElement.setAttribute("fill", fill);
      newElement.setAttribute("stroke-width", strokeWidth);
      newElement.setAttribute("cx", rectStartX);
      newElement.setAttribute("cy", rectStartY);
      break;
    case "circle":
      newElement = document.createElementNS(svgNS, "circle");
      newElement.setAttribute("stroke", stroke);
      newElement.setAttribute("fill", fill);
      newElement.setAttribute("stroke-width", strokeWidth);
      newElement.setAttribute("cx", rectStartX);
      newElement.setAttribute("cy", rectStartY);
      break;
    case "path":
      bufferSize = 4;
      newElement = document.createElementNS(svgNS, "path");
      newElement.setAttribute("fill", "none");
      newElement.setAttribute("stroke", stroke);
      newElement.setAttribute("stroke-width", strokeWidth);
      buffer = [];
      var pt = getMousePosition(event);
      appendToBuffer(pt);
      strPath = "M" + pt.x + " " + pt.y;
      newElement.setAttribute("d", strPath);
      break;
    default:
      return;
  }

  drawingBoard.appendChild(newElement);
}

function onMouseMove(event) {
  var x2 = event.clientX - bRect.left;
  var y2 = event.clientY - bRect.top;
  var width = Math.abs(event.clientX - rectStartX);
  var height = Math.abs(event.clientY - rectStartY - bRect.top);

  if (drawing) {
    switch (elementType) {
      case "line":
        newElement.setAttribute("x2", x2);
        newElement.setAttribute("y2", y2);
        break;
      case "rect":
        newElement.setAttribute("width", width);
        newElement.setAttribute("height", height);
        break;
      case "ellipse":
        newElement.setAttribute("rx", width);
        newElement.setAttribute("ry", height);
        break;
      case "circle":
        newElement.setAttribute("r", width);
        break;
      case "path":
        appendToBuffer(getMousePosition(event));
        updateSvgPath();
    }
  }
}

function onMouseUp(event) {
  drawing = false;
}

function getMousePosition(e) {
  return {
    x: e.clientX - bRect.left,
    y: e.clientY - bRect.top,
  };
}

function appendToBuffer(pt) {
  buffer.push(pt);
  while (buffer.length > bufferSize * 1.4) {
    buffer.shift();
  }
}

function getAveragePoint(offset) {
  var len = buffer.length;
  if (len % 2 === 1 || len > bufferSize) {
    var totalX = 0;
    var totalY = 0;
    var pt, i;
    var count = 0;
    for (i = offset; i < len; i++) {
      count++;
      pt = buffer[i];
      totalX += pt.x;
      totalY += pt.y;
    }
    return {
      x: totalX / count,
      y: totalY / count,
    };
  }
  return null;
}

function updateSvgPath() {
  var pt = getAveragePoint(0);

  if (pt) {
    strPath += " L" + pt.x + " " + pt.y;
    var tmpPath = "";
    for (var offset = 2; offset < buffer.length; offset += 2) {
      pt = getAveragePoint(offset);
      tmpPath += " L" + pt.x + " " + pt.y;
    }

    newElement.setAttribute("d", strPath + tmpPath);
  }
}

function setup() {
  drawingBoard.addEventListener("mousemove", onMouseMove);
  drawingBoard.addEventListener("mousedown", onMouseDown);
  drawingBoard.addEventListener("mouseup", onMouseUp);
}

var shapesArr = [
  createFreeHand,
  createLine,
  createCircle,
  createRect,
  createEllipse,
];

for (var i = 0; i < shapesArr.length; i++) {
  shapesArr[i].addEventListener("click", function () {
    setup();
    drawingBoard.style.cursor = "crosshair";
  });
}

function stopDrawing() {
  drawingBoard.removeEventListener("mousemove", onMouseMove);
  drawingBoard.removeEventListener("mousedown", onMouseDown);
  drawingBoard.removeEventListener("mouseup", onMouseUp);
}

selectTool.addEventListener("click", function () {
  stopDrawing();
  drawingBoard.style.cursor = "default";
});

clearCanvas.addEventListener("click", function () {
  while (drawingBoard.firstChild) {
    drawingBoard.removeChild(drawingBoard.firstChild);
  }
});

// var colorArr = [
//   "#e6194B",
//   "#3cb44b",
//   "#ffe119",
//   "#4363d8",
//   "#f58231",
//   "#911eb4",
//   "#42d4f4",
//   "#f032e6",
//   "#bfef45",
//   "#fabed4",
//   "#469990",
//   "#dcbeff",
//   "#9A6324",
//   "#fffac8",
//   "#800000",
//   "#aaffc3",
//   "#808000",
//   "#ffd8b1",
//   "#000075",
//   "#a9a9a9",
//   "#ffffff",
//   "#000000",
// ];
