import { Router } from 'express';
import * as controller from '../controllers/elementController.js';

const router = Router();

// Kolekcja pierwiastków
router.get('/', controller.list);
router.post('/', controller.create);
router.options('/', controller.collectionOptions);
router.all('/', controller.collectionMethodNotAllowed);

// Pojedynczy pierwiastek
router.get('/:atomicNumber', controller.get);
router.put('/:atomicNumber', controller.replace);
router.patch('/:atomicNumber', controller.update);
router.delete('/:atomicNumber', controller.remove);
router.options('/:atomicNumber', controller.itemOptions);
router.all('/:atomicNumber', controller.itemMethodNotAllowed);

export default router;
