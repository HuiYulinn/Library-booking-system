const express = require('express');
const { adminPasswordRequired } = require('../middleware/authMiddleware');
const router = express.Router();

// 仅做口令校验，不设置会话（简单模式）
router.post('/verify', adminPasswordRequired, (req, res) => {
  res.json({ success:true, message:'管理员口令正确' });
});

module.exports = router;
