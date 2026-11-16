import { Router } from 'express';
import * as elementsController from '../controllers/elementController.js';
//import * as countController from '../controllers/countController.js'
import * as requestCountController from '../controllers/requestCounterController.js'

const router = Router();

// Kolekcja pierwiastków
router.get('/', elementsController.list);
router.post('/', elementsController.create);
router.options('/', elementsController.collectionOptions);
router.all('/', elementsController.collectionMethodNotAllowed);

// Pojedynczy pierwiastek
router.get('/:atomicNumber', elementsController.get);
router.put('/:atomicNumber', requestCountController.checkAuthorized, elementsController.replace);
router.patch('/:atomicNumber', requestCountController.checkAuthorized, elementsController.update);
router.delete('/:atomicNumber', requestCountController.checkAuthorized, elementsController.remove);
router.options('/:atomicNumber', elementsController.itemOptions);
router.all('/:atomicNumber', elementsController.itemMethodNotAllowed);

router.get('counts', requestCountController.getRequestStats)
export default router;
