(function () {
   'use strict';
}());

var GifGenerator = function () {
};

GifGenerator.prototype.generateRandomGif = function(imagesArray) {
  //the first statement should generate a random number in the range 0 to 6 (the subscript values of the image file names in the imagesArray)
  var numberOfImages = parseInt(imagesArray.length) - 1;
  var randomNumber = Math.floor(Math.random() * numberOfImages); // 0...6

  return imagesArray[randomNumber];
};


module.exports = GifGenerator;
