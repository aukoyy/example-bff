import express from 'express';
import controller from '../controllers/listings';
const router = express.Router();

router.get('/listings/:id', controller.getListing);
router.get('/listings', controller.getListings);
router.post('/listings', controller.addListing);
router.put('/listings/:id', controller.likeListing);

router.get('/listings/search/:query', controller.searchListing);

export = router;
