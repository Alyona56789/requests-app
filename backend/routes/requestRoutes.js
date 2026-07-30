const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.post('/request/', requestController.createRequest);
router.get('/requests/', requestController.getUnboundRequests);
router.get('/request/:id/', requestController.getRequestById);
router.patch('/request/:id/', requestController.updateRequest);
router.delete('/request/:id/', requestController.deleteRequest);

module.exports = router;