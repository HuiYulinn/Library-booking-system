const { pool } = require('../config/db');

class UserModel {
    // 获取所有用户
    static async getAllUsers() {
        const [rows] = await pool.query('SELECT id, username, name, email, phone, created_at FROM users');
        return rows;
    }

    // 根据ID获取用户
    static async getUserById(id) {
        const [rows] = await pool.query(
            'SELECT id, username, name, email, phone, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // 根据用户名获取用户
    static async getUserByUsername(username) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    // 创建用户
    static async createUser(userData) {
        const { username, password, name, email, phone } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (username, password, name, email, phone) VALUES (?, ?, ?, ?, ?)',
            [username, password, name, email, phone]
        );
        return result.insertId;
    }

    // 更新用户信息
    static async updateUser(id, userData) {
        const { name, email, phone } = userData;
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, id]
        );
        return result.affectedRows;
    }

    // 删除用户
    static async deleteUser(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = UserModel;



// 更新用户密码（存储 bcrypt 哈希）
async function updateUserPassword(id, passwordHash) {
    const [result] = await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [passwordHash, id]
    );
    return result.affectedRows;
}

module.exports.updateUserPassword = updateUserPassword;
