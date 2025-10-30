const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'library_booking',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}; 

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✓ 数据库连接成功');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ 数据库连接失败:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection
};

