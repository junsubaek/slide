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

let rafId;
let move = 0;

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
  coordinate.velocity = [];
  flagGroup.availableKeyDown = true;
  move = 0;
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

// const moveSlide = () => {
//   lafId = requestAnimationFrame(moveSlide);

//   if (coordinate.slideMoveRatio > 0) {
//     if (move < coordinate.endX) {
//       move += 3;
//       DOMGroup.slideContainer.style.transform = `translate3d(${-move}px,0,0)`;
//     } else {
//       cancelAnimationFrame(lafId);
//     }
//   } else {
//     if (move < -coordinate.endX) {
//       move += 3;
//       DOMGroup.slideContainer.style.transform = `translate3d(${move}px,0,0)`;
//     } else {
//       cancelAnimationFrame(lafId);
//     }
//   }
// };

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
// let acc = 0;
// const moveRemainingDistance = () => {
//   lafId = requestAnimationFrame(moveRemainingDistance);

//   if (coordinate.slideMoveRatio > 0) {
//     if (move <= DOMGroup.screen.clientWidth) {
//       console.log(move);
//       move += 1;

//       DOMGroup.slideContainer.style.transform = `translate3d(-${move}px,0,0)`;
//     } else {
//       cancelAnimationFrame(lafId);
//       changeImagesOrder("LEFT");
//     }
//   } else {
//     DOMGroup.slideContainer.style.transform = `translate3d(${DOMGroup.screen.clientWidth}px,0,0)`;
//     changeImagesOrder("RIGHT");
//   }
//   DOMGroup.slideContainer.addEventListener("transitionend", () => {
//     resetCurrentState();
//     resetImages();
//     resetOrderNumber();
//   });
// };

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

const mouseDownHandler = (e) => {
  if (devicePixelRatio !== 1) return;
  if (!flagGroup.availableKeyDown) return;

  coordinate.startX = e.clientX;
  flagGroup.moveDown = true;
};

const mouseUpHandler = () => {
  if (devicePixelRatio !== 1) return;
  if (!flagGroup.moveDown) return;

  coordinate.moreThanHalf =
    Math.abs(DOMGroup.screen.clientWidth * coordinate.slideMoveRatio) >=
    DOMGroup.screen.clientWidth / 2;
  coordinate.skip =
    Math.abs(coordinate.velocity.reduce((acc, v) => acc + v)) <
      coordinate.maximumSkipFigure &&
    Math.abs(coordinate.endX - coordinate.prevX) >=
      coordinate.minimumSkipFigure;
  flagGroup.availableKeyDown = false;
  flagGroup.moveDown = false;
  checkMovedDistance(coordinate.moreThanHalf, coordinate.skip);
};

const mouseMoveHandler = (e) => {
  if (devicePixelRatio !== 1) return;
  if (!flagGroup.moveDown) return;

  coordinate.prevX = coordinate.endX;
  coordinate.endX = coordinate.startX - e.clientX;
  coordinate.slideMoveRatio = coordinate.endX / DOMGroup.screen.clientWidth;
  coordinate.velocity.push(coordinate.endX);
  moveSlide();
};

const mouseOutHandler = () => {
  if (devicePixelRatio !== 1) return;
  if (!flagGroup.moveDown) return;

  coordinate.moreThanHalf =
    Math.abs(DOMGroup.screen.clientWidth * coordinate.slideMoveRatio) >=
    DOMGroup.screen.clientWidth / 2;
  flagGroup.availableKeyDown = false;
  flagGroup.moveDown = false;
  checkMovedDistance(coordinate.moreThanHalf);
};

const touchStartHandler = (e) => {
  console.log(1);
  if (!flagGroup.availableKeyDown) return;

  coordinate.startX = e.targetTouches[0].clientX;
  flagGroup.moveDown = true;
};

const touchEndHandler = () => {
  if (!flagGroup.moveDown) return;

  coordinate.moreThanHalf =
    Math.abs(DOMGroup.screen.clientWidth * coordinate.slideMoveRatio) >=
    DOMGroup.screen.clientWidth / 2;
  coordinate.skip =
    Math.abs(coordinate.velocity.reduce((acc, v) => acc + v)) <
      coordinate.maximumSkipFigure &&
    Math.abs(coordinate.endX - coordinate.prevX) >=
      coordinate.minimumSkipFigure;
  flagGroup.availableKeyDown = false;
  flagGroup.moveDown = false;
  checkMovedDistance(coordinate.moreThanHalf, coordinate.skip);
};

const touchMoveHandler = (e) => {
  if (!flagGroup.moveDown) return;

  coordinate.prevX = coordinate.endX;
  coordinate.endX = coordinate.startX - e.targetTouches[0].clientX;
  coordinate.slideMoveRatio = coordinate.endX / DOMGroup.screen.clientWidth;
  coordinate.velocity.push(coordinate.endX);
  moveSlide();
};

DOMGroup.screen.addEventListener("mousedown", mouseDownHandler);
DOMGroup.screen.addEventListener("mouseup", mouseUpHandler);
DOMGroup.screen.addEventListener("mousemove", mouseMoveHandler);
DOMGroup.screen.addEventListener("mouseout", mouseOutHandler);

DOMGroup.screen.addEventListener("touchstart", touchStartHandler);
DOMGroup.screen.addEventListener("touchend", touchEndHandler);
DOMGroup.screen.addEventListener("touchmove", touchMoveHandler);

resetImages();
