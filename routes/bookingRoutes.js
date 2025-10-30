const express = require('express');
const router = express.Router();
const BookingModel = require('../models/bookingModel');

// 获取所有预约
router.get('/', async (req, res) => {
    try {
        const bookings = await BookingModel.getAllBookings();
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取预约列表失败',
            error: error.message
        });
    }
});

// 获取单个预约
router.get('/:id', async (req, res) => {
    try {
        const booking = await BookingModel.getBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: '预约不存在'
            });
        }
        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取预约信息失败',
            error: error.message
        });
    }
});

// 根据用户ID获取预约
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await BookingModel.getBookingsByUserId(req.params.userId);
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户预约失败',
            error: error.message
        });
    }
});

// 根据座位ID获取预约
router.get('/seat/:seatId', async (req, res) => {
    try {
        const bookings = await BookingModel.getBookingsBySeatId(req.params.seatId);
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取座位预约失败',
            error: error.message
        });
    }
});

// 获取指定日期的预约统计
router.get('/stats/:date', async (req, res) => {
    try {
        const stats = await BookingModel.getBookingStatsByDate(req.params.date);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取预约统计失败',
            error: error.message
        });
    }
});

// 创建预约
router.post('/', async (req, res) => {
    try {
        const bookingId = await BookingModel.createBooking(req.body);
        res.status(201).json({
            success: true,
            message: '预约成功',
            data: { id: bookingId }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || '预约失败',
            error: error.message
        });
    }
});



// 取消预约
router.post('/:id/cancel', async (req, res) => {
    try {
        const affectedRows = await BookingModel.cancelBooking(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '预约不存在'
            });
        }
        res.json({
            success: true,
            message: '预约已取消'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '取消预约失败',
            error: error.message
        });
    }
});

// 删除预约
router.delete('/:id', async (req, res) => {
    try {
        const affectedRows = await BookingModel.deleteBooking(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '预约不存在'
            });
        }
        res.json({
            success: true,
            message: '预约删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除预约失败',
            error: error.message
        });
    }
});

module.exports = router;

