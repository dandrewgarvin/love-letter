interface Card {
  name: string;
  value: number;
  ability: string;
}

interface Player {
  id: string;
  name: string;
  cards: Card[];
}

interface Room {
  id: string;
  players: Player[];
}

interface Log {
  timestamp: string;
  message: string;
}

export { Card, Player, Room, Log };
