// add the game over clauses
// this will restart the game if the snake hits something
// add the code for body collision
// if the head of the snake bumps into anything in the array, game over
checkCollision = function (x, y, array) {

  if (x == -1 || x == MAX_WIDTH / CELL_WIDTH || y == -1 || y == MAX_HEIGHT / CELL_WIDTH) {
    return true;
  }

  return _.any(array, function (elem) {
    return elem.x == x && elem.y == y;
  });
};