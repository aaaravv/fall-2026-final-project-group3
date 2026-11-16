// 10 clubs to start with, each club has a name, password, and members with ranks and names

export const clubs = [
  {
    id: 'club-1',
    name: 'Computer Science',
    password: 'cs123',
    members: [
      { rank: 1, name: 'George Washington' },
      { rank: 2, name: 'Hal Jordan' },
      { rank: 3, name: 'Harry Potter' },
      { rank: 4, name: 'Hunter Andrews' },
    ],
  },
  {
    id: 'club-2',
    name: 'Artificial Intelligence',
    password: 'ai123',
    members: [
      { rank: 1, name: 'Hunter Andrews' },
      { rank: 2, name: 'Lewis Hamilton' },
      { rank: 3, name: 'Brad Pitt' },
      { rank: 4, name: 'LeBron James' },
    ],
  },
  {
    id: 'club-3',
    name: 'Cybersecurity',
    password: 'cyber123',
    members: [
      { rank: 1, name: 'Harry Potter' },
      { rank: 2, name: 'Hunter Andrews' },
      { rank: 3, name: 'George Washington' },
    ],
  },
  ...['Mathematics', 'Engineering', 'Business', 'Gaming', 'Robotics', 'Research', 'Athletics']
    .map((name, index) => ({
      id: `club-${index + 4}`,
      name,
      password: `club${index + 4}123`,
      members: [
        { rank: 1, name: 'George Washington' },
        { rank: 2, name: 'Hunter Andrews' },
        { rank: 3, name: 'Lewis Hamilton' },
      ],
    })),
]