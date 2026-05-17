import { TriviaDeck } from '@/lib/types';

export const weirdTriviaDeck: TriviaDeck = {
  id: 'weird',
  name: 'Weird and Wonderful',
  emoji: '🦑',
  color: '#A78BFA',
  description: 'Facts that sound made up.',
  questions: [
    { q: 'How many hearts does an octopus have?', options: ['1', '2', '3', '4'], answer: 2 },
    { q: 'What color is a polar bears skin under its fur?', options: ['White', 'Pink', 'Black', 'Grey'], answer: 2 },
    { q: 'Which animal can sleep for up to three years at a time?', options: ['Bear', 'Snail', 'Sloth', 'Bat'], answer: 1 },
    { q: 'What is the only food that never spoils?', options: ['Salt', 'Sugar', 'Honey', 'Rice'], answer: 2 },
    { q: 'How long is one day on Venus compared to Earth?', options: ['12 hours', '1 Earth week', '243 Earth days', '1 Earth year'], answer: 2 },
    { q: 'A group of flamingos is called a what?', options: ['Flock', 'Flamboyance', 'Flutter', 'Flair'], answer: 1 },
    { q: 'Which planet rains diamonds, according to current theory?', options: ['Mars', 'Neptune', 'Mercury', 'Saturn'], answer: 1 },
    { q: 'What is the smallest country in the world by area?', options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], answer: 2 },
    { q: 'How many bones is a baby born with?', options: ['206', '270', '300', '350'], answer: 2 },
    { q: 'Which animal has fingerprints almost identical to humans?', options: ['Gorilla', 'Koala', 'Chimpanzee', 'Orangutan'], answer: 1 },
    { q: 'What is a banana botanically classified as?', options: ['Fruit', 'Berry', 'Vegetable', 'Herb'], answer: 1 },
    { q: 'How many time zones does France span (counting overseas territories)?', options: ['5', '8', '12', '15'], answer: 2 },
  ],
};
