export type Piece = {
  type: 'red' | 'blue';
  position: number;
};

export type GameTimer = {
  timeLeft: number;
};