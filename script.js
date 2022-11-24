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
var noFill = document.querySelector("[data-type='noFill']");
var startX, startY, endX, endY, dragElement;
var newElement, elementType, rectStartX, rectStartY;
var drawing = false;
var bRect = drawingBoard.getBoundingClientRect();
var strokeWidth = 4;
var stroke = "black";
var fill = "none";
var bufferSize, strPath;
var buffer = [];

noFill.addEventListener("click", function () {
  fill = "none";
});

strokeSlider.oninput = function () {
  strokeWidth = this.value;
  strokeSliderValue.innerText = this.value;
};

document.addEventListener("click", function (e) {
  var itemType = e.target.dataset.type;

  switch (itemType) {
    case "line":
    case "rect":
    case "circle":
    case "ellipse":
    case "freeHand":
      drawingBoard.removeEventListener("click", deleteElement);
      drawingBoard.removeEventListener("mousedown", dragMouseDown);
      drawingBoard.removeEventListener("mousemove", dragMouseMove);
      if (itemType !== "freeHand") {
        elementType = itemType;
      } else {
        elementType = "path";
      }
      break;
    case "selectTool":
      // drag elements
      drawingBoard.addEventListener("mousedown", dragMouseDown);
      drawingBoard.removeEventListener("click", deleteElement);
      drawingBoard.addEventListener("mouseup", stopDragging);
      break;
    case "eraser":
      drawingBoard.addEventListener("click", deleteElement);
      drawingBoard.style.cursor = "no-drop";
      stopDrawing();
      stopDragging();
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
      break;
    case "rect":
      newElement = document.createElementNS(svgNS, "rect");
      newElement.setAttribute("x", rectStartX);
      newElement.setAttribute("y", rectStartY);
      break;
    case "ellipse":
      newElement = document.createElementNS(svgNS, "ellipse");
      newElement.setAttribute("cx", rectStartX);
      newElement.setAttribute("cy", rectStartY);
      break;
    case "circle":
      newElement = document.createElementNS(svgNS, "circle");
      newElement.setAttribute("cx", rectStartX);
      newElement.setAttribute("cy", rectStartY);
      break;
    case "path":
      bufferSize = 6;
      newElement = document.createElementNS(svgNS, "path");
      fill = "none";
      buffer = [];
      var pt = getMousePosition(event);
      appendToBuffer(pt);
      strPath = "M" + pt.x + " " + pt.y;
      newElement.setAttribute("d", strPath);
      break;
    default:
      return;
  }

  newElement.setAttribute("stroke", stroke);
  newElement.setAttribute("fill", fill);
  newElement.setAttribute("stroke-width", strokeWidth);
  newElement.setAttribute("class", "dragable");
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
  while (buffer.length > bufferSize * 1.3) {
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

for (var i = 0; i < swatchFillArr.length; i++) {
  swatchFillArr[i].addEventListener("click", function (e) {
    fill = e.target.style.backgroundColor;
  });
}

function deleteElement(e) {
  if (e.target.tagName === "svg") {
    return;
  } else {
    drawingBoard.removeChild(e.target);
  }
}

function dragMouseDown(e) {
  var dE = e.target;
  if (dE.classList.contains("dragable")) {
    startX = e.offsetX;
    startY = e.offsetY;
    dragElement = e.target;
    console.log(dragElement.tagName);
    switch (dragElement.tagName) {
      case "rect":
        endX = +dragElement.getAttributeNS(null, "x");
        endY = +dragElement.getAttributeNS(null, "y");
        break;
      case "circle":
      case "ellipse":
        endX = +dragElement.getAttributeNS(null, "cx");
        endY = +dragElement.getAttributeNS(null, "cy");
        break;
    }
    drawingBoard.addEventListener("mousemove", dragMouseMove);
  }
}

function dragMouseMove(event) {
  var x = event.offsetX;
  var y = event.offsetY;
  switch (dragElement.tagName) {
    case "rect":
      dragElement.setAttributeNS(null, "x", endX + x - startX);
      dragElement.setAttributeNS(null, "y", endY + y - startY);
      break;
    case "circle":
    case "ellipse":
      dragElement.setAttributeNS(null, "cx", endX + x - startX);
      dragElement.setAttributeNS(null, "cy", endY + y - startY);
      break;
  }
}
function stopDragging() {
  drawingBoard.removeEventListener("mousemove", dragMouseMove);
}
