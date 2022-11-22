var drawingBoard = document.querySelector("#drawingBoard");
var selectTool = document.querySelector("[data-type='selectTool']");
var svgNS = "http://www.w3.org/2000/svg";
var deleteTool = document.querySelector("[data-type='eraser']");
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

var newElement;
var elementType;
var rectStartX;
var rectStartY;
var drawing = false;
var bRect = drawingBoard.getBoundingClientRect();
var strokeWidth = 4;
var stroke = "black";
var fill = "white";
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
    case "eraser":
      drawingBoard.addEventListener("click", deleteElement);
      drawingBoard.style.cursor = "no-drop";
      break;
    case "line":
    case "rect":
    case "circle":
    case "ellipse":
    case "freeHand":
      drawingBoard.removeEventListener("click", deleteElement);
      if (itemType !== "freeHand") {
        elementType = itemType;
      } else {
        elementType = "path";
      }

      break;
  }
});

function onMouseDown(event) {
  drawing = true;
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
        break;
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

var strokeColorArr = [
  "#ea5545",
  "#f46a9b",
  "#ef9b20",
  "#edbf33",
  "#ede15b",
  "#bdcf32",
  "#87bc45",
  "#27aeef",
  "#b33dc6",
  "#ffffff",
  "#000000",
];

var fillColorArr = [
  "#fd7f6f",
  "#7eb0d5",
  "#b2e061",
  "#bd7ebe",
  "#ffb55a",
  "#ffee65",
  "#beb9db",
  "#fdcce5",
  "#8bd3c7",
  "#ffffff",
  "#000000",
  "none",
];

var strokeDiv = document.getElementById("strokeDiv");
var fillDiv = document.getElementById("fillDiv");

(function () {
  for (var i = 0; i < strokeColorArr.length; i++) {
    var colorDiv = document.createElement("div");
    colorDiv.classList.add("swatchStroke");
    colorDiv.style.backgroundColor = strokeColorArr[i];
    strokeDiv.appendChild(colorDiv);
  }

  for (var i = 0; i < fillColorArr.length; i++) {
    var colorDiv = document.createElement("div");
    colorDiv.classList.add("swatchFill");
    colorDiv.style.backgroundColor = fillColorArr[i];
    fillDiv.appendChild(colorDiv);
  }
})();

var swatchStrokeArr = [...document.querySelectorAll(".swatchStroke")];
var swatchFillArr = [...document.querySelectorAll(".swatchFill")];

for (var i = 0; i < strokeColorArr.length; i++) {
  swatchStrokeArr[i].addEventListener("click", function (e) {
    stroke = e.target.style.backgroundColor;
  });
}

for (var i = 0; i < fillColorArr.length; i++) {
  swatchFillArr[i].addEventListener("click", function (e) {
    fill = e.target.style.backgroundColor;
  });
}

var deleteElement = function (e) {
  if (e.target.tagName === "svg") {
    return;
  } else {
    drawingBoard.removeChild(e.target);
  }
};
