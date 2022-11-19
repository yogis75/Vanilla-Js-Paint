var drawingBoard = document.querySelector("#drawingBoard");
var selectTool = document.querySelector(".selectTool");
var svgNS = "http://www.w3.org/2000/svg";
var createLine = document.querySelector("[data-type='line']");
var createRect = document.querySelector("[data-type='rect']");
var createCircle = document.querySelector("[data-type='circle']");
var createEllipse = document.querySelector("[data-type='ellipse']");
var createFreeHand = document.querySelector("[data-type='freeHand']");
var clearCanvas = document.querySelector("[data-type='clearCanvas']");

var newElement;
var elementType;
var rectStartX;
var rectStartY;
var drawing = false;
var bRect = drawingBoard.getBoundingClientRect();
var stroke = "black";
var strokeWidth = 2;
var fill = "none";

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
    }
  }
}

function onMouseUp(event) {
  drawing = false;
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
