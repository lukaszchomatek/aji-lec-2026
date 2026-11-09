import { elements } from './elements.js';
export const elementModel = {
  all: () => elements,
  find: number => elements.find(e => e.atomicNumber === number),
  findIndex: number => elements.findIndex(e => e.atomicNumber === number),
  conflict: (candidate, ignoredNumber = null) => elements.some(e =>
    e.atomicNumber !== ignoredNumber &&
    (e.atomicNumber === candidate.atomicNumber || e.symbol === candidate.symbol)),
  insert: element => elements.push(element),
  replace: (index, element) => { elements[index] = element; },
  remove: index => elements.splice(index, 1)
};
