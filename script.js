const DOMGroup = {
  screen: document.querySelector(".screen"),
  slideContainer: document.querySelector(".slide-container"),
  slides: document.querySelectorAll(".slide"),
  orderNumber: document.querySelector(".order"),
};

const imageGroup = {
  paths: [
    { src: "images/photo1.png", index: 4 },
    { src: "images/photo2.png", index: 5 },
    { src: "images/photo3.png", index: 1 },
    { src: "images/photo4.png", index: 2 },
    { src: "images/photo5.png", index: 3 },
  ],
  tempImages: [],
};

const location = {
  startX: 0,
  endX: 0,
  prevX: 0,
  slideMoveRatio: 0,
  movedDistance: 0,
  velocity: [],
  moreThanHalf: false,
  skip: false,
  maximumSkipFigure: 1000,
  minimumSkipFigure: 5,
};

const flagGroup = {
  moveDown: false,
  availableKeyDown: true,
};

const createImageElem = () => {
  for (
    let i = parseInt(imageGroup.paths.length / 2) - 1;
    i <= parseInt(imageGroup.paths.length / 2) + 1;
    i++
  ) {
    const image = document.createElement("img");
    image.src = imageGroup.paths[i].src;
    imageGroup.tempImages.push(image);
  }
};

const drawImages = () => {
  for (let i = 0; i < DOMGroup.slides.length; i++) {
    if (DOMGroup.slides[i].firstChild) {
      DOMGroup.slides[i].removeChild(DOMGroup.slides[i].firstChild);
    }
    DOMGroup.slides[i].appendChild(imageGroup.tempImages[i]);
  }
};

const resetImages = () => {
  createImageElem();
  drawImages();
};

const resetCurrentState = () => {
  DOMGroup.slideContainer.style.transform = "";
  DOMGroup.slideContainer.style.transition = "";
  imageGroup.tempImages = [];
  location.velocity = [];
  flagGroup.availableKeyDown = true;
};

const resetOrderNumber = () => {
  DOMGroup.orderNumber.innerHTML = `
    ${imageGroup.paths[parseInt(imageGroup.paths.length / 2)].index} / ${
    imageGroup.paths.length
  }
    `;
};

const changeImagesOrder = (direction) => {
  if (direction === "LEFT") {
    imageGroup.paths.push(imageGroup.paths.shift());
  } else {
    imageGroup.paths.unshift(imageGroup.paths.pop());
  }
};

const moveSlide = () => {
  location.movedDistance =
    DOMGroup.screen.clientWidth * location.slideMoveRatio;
  DOMGroup.slideContainer.style.transform = `translate(${-location.movedDistance}px)`;
};

const moveRemainingDistance = () => {
  if (location.slideMoveRatio > 0) {
    DOMGroup.slideContainer.style.transform = `translate(${-DOMGroup.screen
      .clientWidth}px)`;
    changeImagesOrder("LEFT");
  } else {
    DOMGroup.slideContainer.style.transform = `translate(${DOMGroup.screen.clientWidth}px)`;
    changeImagesOrder("RIGHT");
  }
  // location.movedDistance - DOMGroup.screen.clientWidth - location.movedDistance
  // location.movedDistance + DOMGroup.screen.clientWidth - location.movedDistance
  DOMGroup.slideContainer.addEventListener("transitionend", () => {
    resetCurrentState();
    resetImages();
    resetOrderNumber();
  });
};

const checkMovedDistance = (moreThanHalf, skip = false) => {
  DOMGroup.slideContainer.style.transition = "1s";
  if (moreThanHalf) {
    moveRemainingDistance();
    location.moreThanHalf = false;
  } else {
    if (skip) {
      moveRemainingDistance();
      location.skip = false;
    } else {
      DOMGroup.slideContainer.style.transform = `translate(0px)`;
      DOMGroup.slideContainer.addEventListener("transitionend", () => {
        resetCurrentState();
      });
    }
  }
};

const mouseDownHandler = (e) => {
  if (flagGroup.availableKeyDown) {
    location.startX = e.clientX;
    flagGroup.moveDown = true;
  }
};

const mouseUpHandler = () => {
  if (flagGroup.moveDown) {
    location.moreThanHalf =
      Math.abs(DOMGroup.screen.clientWidth * location.slideMoveRatio) >=
      DOMGroup.screen.clientWidth / 2
        ? true
        : false;
    location.skip =
      Math.abs(location.velocity.reduce((acc, v) => acc + v)) <
        location.maximumSkipFigure &&
      Math.abs(location.endX - location.prevX) >= location.minimumSkipFigure
        ? true
        : false;
    flagGroup.availableKeyDown = false;
    flagGroup.moveDown = false;
    checkMovedDistance(location.moreThanHalf, location.skip);
  }
};

const mouseMoveHandler = (e) => {
  if (flagGroup.moveDown) {
    location.prevX = location.endX;
    location.endX = location.startX - e.clientX;
    location.slideMoveRatio = location.endX / DOMGroup.screen.clientWidth;
    location.velocity.push(location.endX);
    moveSlide();
  }
};

const mouseOutHandler = () => {
  if (flagGroup.moveDown) {
    location.moreThanHalf =
      Math.abs(DOMGroup.screen.clientWidth * location.slideMoveRatio) >=
      DOMGroup.screen.clientWidth / 2
        ? true
        : false;
    flagGroup.availableKeyDown = false;
    flagGroup.moveDown = false;
    checkMovedDistance(location.moreThanHalf);
  }
};

DOMGroup.screen.addEventListener("mousedown", mouseDownHandler);
DOMGroup.screen.addEventListener("mouseup", mouseUpHandler);
DOMGroup.screen.addEventListener("mousemove", mouseMoveHandler);
DOMGroup.screen.addEventListener("mouseout", mouseOutHandler);

resetImages();
