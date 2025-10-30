const { pool } = require('../config/db');

class SeatModel {
    // 获取所有座位
    static async getAllSeats() {
        const [rows] = await pool.query('SELECT * FROM seats ORDER BY seat_number');
        return rows;
    }

    // 根据ID获取座位
    static async getSeatById(id) {
        const [rows] = await pool.query('SELECT * FROM seats WHERE id = ?', [id]);
        return rows[0];
    }

    // 根据区域获取座位
    static async getSeatsByArea(area) {
        const [rows] = await pool.query(
            'SELECT * FROM seats WHERE area = ? ORDER BY seat_number',
            [area]
        );
        return rows;
    }

    // 根据楼层获取座位
    static async getSeatsByFloor(floor) {
        const [rows] = await pool.query(
            'SELECT * FROM seats WHERE floor = ? ORDER BY seat_number',
            [floor]
        );
        return rows;
    }

    // 获取可用座位
    static async getAvailableSeats(date, startTime, endTime) {
        const query = `
            SELECT s.* FROM seats s
            WHERE s.status = 'available'
            AND s.id NOT IN (
                SELECT seat_id FROM bookings
                WHERE booking_date = ?
                AND status IN ('pending', 'confirmed')
                AND (
                    (start_time <= ? AND end_time > ?)
                    OR (start_time < ? AND end_time >= ?)
                    OR (start_time >= ? AND end_time <= ?)
                )
            )
            ORDER BY s.seat_number
        `;
        const [rows] = await pool.query(query, [date, startTime, startTime, endTime, endTime, startTime, endTime]);
        return rows;
    }

    // 创建座位
    static async createSeat(seatData) {
        const { seat_number, area, floor, status, has_power, has_lamp } = seatData;
        const [result] = await pool.query(
            'INSERT INTO seats (seat_number, area, floor, status, has_power, has_lamp) VALUES (?, ?, ?, ?, ?, ?)',
            [seat_number, area, floor, status || 'available', has_power || false, has_lamp || false]
        );
        return result.insertId;
    }

    // 更新座位
    static async updateSeat(id, seatData) {
        const { seat_number, area, floor, status, has_power, has_lamp } = seatData;
        const [result] = await pool.query(
            'UPDATE seats SET seat_number = ?, area = ?, floor = ?, status = ?, has_power = ?, has_lamp = ? WHERE id = ?',
            [seat_number, area, floor, status, has_power, has_lamp, id]
        );
        return result.affectedRows;
    }

    // 删除座位
    static async deleteSeat(id) {
        const [result] = await pool.query('DELETE FROM seats WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // 获取所有区域
    static async getAreas() {
        const [rows] = await pool.query('SELECT DISTINCT area, floor FROM seats ORDER BY floor, area');
        return rows;
    }
}

module.exports = SeatModel;

