const { pool } = require('../config/db');

class BookingModel {
    // 获取所有预约
    static async getAllBookings() {
        const query = `
            SELECT b.*, u.username, u.name as user_name, s.seat_number, s.area
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN seats s ON b.seat_id = s.id
            ORDER BY b.booking_date DESC, b.start_time DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    // 根据ID获取预约
    static async getBookingById(id) {
        const query = `
            SELECT b.*, u.username, u.name as user_name, s.seat_number, s.area
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN seats s ON b.seat_id = s.id
            WHERE b.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    // 根据用户ID获取预约
    static async getBookingsByUserId(userId) {
        const query = `
            SELECT b.*, s.seat_number, s.area
            FROM bookings b
            JOIN seats s ON b.seat_id = s.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC, b.start_time DESC
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    // 根据座位ID获取预约
    static async getBookingsBySeatId(seatId) {
        const query = `
            SELECT b.*, u.username, u.name as user_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.seat_id = ?
            ORDER BY b.booking_date DESC, b.start_time DESC
        `;
        const [rows] = await pool.query(query, [seatId]);
        return rows;
    }

    // 检查座位在指定时间是否可用
    static async isSeatAvailable(seatId, date, startTime, endTime) {
        const query = `
            SELECT COUNT(*) as count FROM bookings
            WHERE seat_id = ?
            AND booking_date = ?
            AND status IN ('pending', 'confirmed')
            AND (
                (start_time <= ? AND end_time > ?)
                OR (start_time < ? AND end_time >= ?)
                OR (start_time >= ? AND end_time <= ?)
            )
        `;
        const [rows] = await pool.query(query, [seatId, date, startTime, startTime, endTime, endTime, startTime, endTime]);
        return rows[0].count === 0;
    }

    // 创建预约
    static async createBooking(bookingData) {
        const { user_id, seat_id, booking_date, start_time, end_time } = bookingData;
        
        // 检查座位是否可用
        const isAvailable = await this.isSeatAvailable(seat_id, booking_date, start_time, end_time);
        if (!isAvailable) {
            throw new Error('该时间段座位已被预约');
        }

        const [result] = await pool.query(
            'INSERT INTO bookings (user_id, seat_id, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, seat_id, booking_date, start_time, end_time, 'confirmed']
        );
        return result.insertId;
    }

    // 更新预约状态
    static async updateBookingStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    }

    // 签到
    static async checkIn(id) {
        const [result] = await pool.query(
            'UPDATE bookings SET check_in_time = NOW(), status = ? WHERE id = ?',
            ['confirmed', id]
        );
        return result.affectedRows;
    }

    // 签退
    static async checkOut(id) {
        const [result] = await pool.query(
            'UPDATE bookings SET check_out_time = NOW(), status = ? WHERE id = ?',
            ['completed', id]
        );
        return result.affectedRows;
    }

    // 取消预约
    static async cancelBooking(id) {
        const [result] = await pool.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            ['cancelled', id]
        );
        return result.affectedRows;
    }

    // 删除预约
    static async deleteBooking(id) {
        const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // 获取指定日期的预约统计
    static async getBookingStatsByDate(date) {
        const query = `
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
            FROM bookings
            WHERE booking_date = ?
        `;
        const [rows] = await pool.query(query, [date]);
        return rows[0];
    }
}

module.exports = BookingModel;

