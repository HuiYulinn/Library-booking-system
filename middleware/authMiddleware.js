const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

function adminPasswordRequired(req, res, next) {
  const entered = (req.body && req.body.admin_password) || (req.query && req.query.admin_password);
  if (!entered) return res.status(401).json({ success:false, message: '管理员密码必填' });
  if (entered !== process.env.ADMIN_PASSWORD) return res.status(403).json({ success:false, message: '密码错误，访问被拒绝' });
  next();
}

// 可选：校验前端携带的 Bearer JWT（目前前端未使用，可预留）
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success:false, message: '缺少身份凭证' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success:false, message: '无效的身份凭证' });
    req.user = user;
    next();
  });
}

module.exports = { adminPasswordRequired, authenticateToken };
