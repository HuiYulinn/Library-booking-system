const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, name = '', email = '', phone = '' } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success:false, message: '用户名和密码必填' });
    }
    const existing = await UserModel.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ success:false, message: '用户名已存在' });
    }
    const hash = await bcrypt.hash(password, 10);
    // 注意：模型的 createUser 使用字段名 password，这里把哈希当作 password 存入
    const newId = await UserModel.createUser({ username, password: hash, name, email, phone });
    const token = jwt.sign({ id: newId, username }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.status(201).json({ success:true, message:'注册成功', token, user:{ id:newId, username, name, email, phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'注册失败', error: err.message });
  }
});

// 登录（兼容：如果数据库里是明文密码，会在首次登录时自动升级为哈希）
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success:false, message: '用户名和密码必填' });
    }
    const user = await UserModel.getUserByUsername(username);
    if (!user) return res.status(401).json({ success:false, message:'用户名或密码错误' });

    const stored = user.password || '';
    let ok = false;
    if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
      ok = await bcrypt.compare(password, stored);
    } else {
      // 明文兼容
      ok = (password === stored);
      if (ok) {
        // 自动升级为哈希
        const newHash = await bcrypt.hash(password, 10);
        try { await UserModel.updateUserPassword(user.id, newHash); } catch (e) { console.warn('升级哈希失败:', e.message); }
      }
    }
    if (!ok) return res.status(401).json({ success:false, message:'用户名或密码错误' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ success:true, message:'登录成功', token, user:{ id:user.id, username:user.username, name:user.name, email:user.email, phone:user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'登录失败', error: err.message });
  }
});

module.exports = router;
