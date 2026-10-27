export const BOTS = [
  {
    id: 'NOVICE',
    name: 'Pawn Prodigy',
    difficulty: 'Novice',
    rating: 800,
    description: 'Learning fundamentals. Fast, relaxed play with occasional blunders.',
    avatar: '♟️',
    depth: 1,
  },
  {
    id: 'INTERMEDIATE',
    name: 'Knight Templar',
    difficulty: 'Intermediate',
    rating: 1300,
    description: 'Solid tactical opponent looking for central development and captures.',
    avatar: '♞',
    depth: 2,
  },
  {
    id: 'ADVANCED',
    name: 'Bishop Strategist',
    difficulty: 'Advanced',
    rating: 1700,
    description: 'Strong positional play controlling diagonals, key outposts, and king safety.',
    avatar: '♝',
    depth: 3,
  },
  {
    id: 'MASTER',
    name: 'Grandmaster Engine',
    difficulty: 'Master',
    rating: 2100,
    description: 'Deep tactical search using alpha-beta pruning. Highly accurate.',
    avatar: '👑',
    depth: 4,
  },
];

export default BOTS;
