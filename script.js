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

const coordinate = {
  startX: 0,
  movedX: 0,
  prevX: 0,
  slideMoveRatio: 0,
  movedDistance: 0,
  velocity: [0],
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
  const selectImageStartPoint = parseInt(imageGroup.paths.length / 2) - 1;
  const selectImageEndPoint = parseInt(imageGroup.paths.length / 2) + 1;
  for (let i = selectImageStartPoint; i <= selectImageEndPoint; i++) {
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
  coordinate.velocity = [0];
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
  coordinate.movedDistance =
    DOMGroup.screen.clientWidth * coordinate.slideMoveRatio;
  DOMGroup.slideContainer.style.transform = `translate3d(${-coordinate.movedDistance}px,0,0)`;
};

const moveRemainingDistance = () => {
  if (coordinate.slideMoveRatio > 0) {
    DOMGroup.slideContainer.style.transform = `translate3d(-${DOMGroup.screen.clientWidth}px,0,0)`;
    changeImagesOrder("LEFT");
  } else {
    DOMGroup.slideContainer.style.transform = `translate3d(${DOMGroup.screen.clientWidth}px,0,0)`;
    changeImagesOrder("RIGHT");
  }
  DOMGroup.slideContainer.addEventListener("transitionend", () => {
    resetCurrentState();
    resetImages();
    resetOrderNumber();
  });
};

const checkMovedDistance = (moreThanHalf, skip = false) => {
  DOMGroup.slideContainer.style.transition = "0.15s";
  if (moreThanHalf) {
    moveRemainingDistance();
    coordinate.moreThanHalf = false;
  } else {
    if (skip) {
      moveRemainingDistance();
      coordinate.skip = false;
    } else {
      DOMGroup.slideContainer.style.transform = `translate3d(0,0,0)`;
      DOMGroup.slideContainer.addEventListener("transitionend", () => {
        resetCurrentState();
      });
    }
  }
};

const autoMoveSlide = () => {
  DOMGroup.slideContainer.style.transition = "0.15s";
  DOMGroup.slideContainer.style.transform = `translate3d(-${DOMGroup.screen.clientWidth}px,0,0)`;
  changeImagesOrder("LEFT");
  DOMGroup.slideContainer.addEventListener("transitionend", () => {
    resetCurrentState();
    resetImages();
    resetOrderNumber();
  });
};

let timer = setInterval(autoMoveSlide, 4000);

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi|mobi/i.test(
    navigator.userAgent
  );
};

const startHandler = (e) => {
  if (!flagGroup.availableKeyDown) return;

  isMobile()
    ? (coordinate.startX = e.targetTouches[0].clientX)
    : (coordinate.startX = e.clientX);
  flagGroup.moveDown = true;
};

const endHandler = () => {
  if (!flagGroup.moveDown) return;

  coordinate.moreThanHalf =
    Math.abs(DOMGroup.screen.clientWidth * coordinate.slideMoveRatio) >=
    DOMGroup.screen.clientWidth / 2;
  coordinate.skip =
    Math.abs(coordinate.velocity.reduce((acc, v) => acc + v)) <
      coordinate.maximumSkipFigure &&
    Math.abs(coordinate.movedX - coordinate.prevX) >=
      coordinate.minimumSkipFigure;
  flagGroup.availableKeyDown = false;
  flagGroup.moveDown = false;

  if (coordinate.velocity.length > 3) {
    checkMovedDistance(coordinate.moreThanHalf, coordinate.skip);
  } else {
    resetCurrentState();
  }
  clearInterval(timer);
  timer = setInterval(autoMoveSlide, 4000);
};

const moveHandler = (e) => {
  if (!flagGroup.moveDown) return;

  coordinate.prevX = coordinate.movedX;
  isMobile()
    ? (coordinate.movedX = coordinate.startX - e.targetTouches[0].clientX)
    : (coordinate.movedX = coordinate.startX - e.clientX);
  coordinate.slideMoveRatio = coordinate.movedX / DOMGroup.screen.clientWidth;
  coordinate.velocity.push(coordinate.movedX);
  moveSlide();
  clearInterval(timer);
};

const outHandler = () => {
  if (!flagGroup.moveDown) return;

  coordinate.moreThanHalf =
    Math.abs(DOMGroup.screen.clientWidth * coordinate.slideMoveRatio) >=
    DOMGroup.screen.clientWidth / 2;
  flagGroup.availableKeyDown = false;
  flagGroup.moveDown = false;
  checkMovedDistance(coordinate.moreThanHalf);
  clearInterval(timer);
  timer = setInterval(autoMoveSlide, 4000);
};

DOMGroup.screen.addEventListener("mousedown", startHandler);
DOMGroup.screen.addEventListener("mouseup", endHandler);
DOMGroup.screen.addEventListener("mousemove", moveHandler);
DOMGroup.screen.addEventListener("mouseout", outHandler);

DOMGroup.screen.addEventListener("touchstart", startHandler);
DOMGroup.screen.addEventListener("touchend", endHandler);
DOMGroup.screen.addEventListener("touchmove", moveHandler);

resetImages();
