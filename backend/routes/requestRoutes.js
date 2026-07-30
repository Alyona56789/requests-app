const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.post('/request/', requestController.createRequest);
router.get('/requests/', requestController.getUnboundRequests);
router.get('/request/:id/', requestController.getRequestById);
router.patch('/request/:id/', requestController.updateRequest);
router.delete('/request/:id/', requestController.deleteRequest);
router.post('/request/:requestId/bind/:projectId/', requestController.bindRequest);
router.post('/request/:requestId/unbind/:projectId/', requestController.unbindRequest);
router.post('/request/:requestId/status/change/', requestController.changeStatus);
router.post('/request/:requestId/status/next/', requestController.nextStatus);
router.post('/request/:requestId/status/prev/', requestController.prevStatus);
router.get('/request/:requestId/status/transitions/', requestController.getStatusTransitions);




module.exports = router;