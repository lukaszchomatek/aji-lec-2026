import { Element } from './elementModel.js';
import { Discoverer } from './discovererModel.js';
import { ElementDiscoverer } from './elementDiscovererModel.js';

Element.belongsToMany(Discoverer, {
  through: ElementDiscoverer,
  foreignKey: 'atomicNumber',
  otherKey: 'discovererId'
});

Discoverer.belongsToMany(Element, {
  through: ElementDiscoverer,
  foreignKey: 'discovererId',
  otherKey: 'atomicNumber'
});