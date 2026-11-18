import { Router } from 'express';
import * as elementsController from '../controllers/elementController.js';
import * as requestCountController from '../controllers/requestCounterController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = Router();

// Statystyki
router.get('/counts', requestCountController.getRequestStats);

// Kolekcja pierwiastków
router.get('/', elementsController.list);
router.post('/', authenticateToken, elementsController.create);
router.options('/', elementsController.collectionOptions);
router.all('/', elementsController.collectionMethodNotAllowed);

router.get('/by-discoverer', elementsController.getByDiscoverer);
// Pojedynczy pierwiastek
router.get('/:atomicNumber', elementsController.get);

router.put(
  '/:atomicNumber',
  authenticateToken,
  requestCountController.checkAuthorized,
  elementsController.replace
);

router.patch(
  '/:atomicNumber',
  authenticateToken,
  requestCountController.checkAuthorized,
  elementsController.update
);

router.delete(
  '/:atomicNumber',
  authenticateToken,
  requestCountController.checkAuthorized,
  elementsController.remove
);

router.options('/:atomicNumber', elementsController.itemOptions);
router.all('/:atomicNumber', elementsController.itemMethodNotAllowed);

export default router;