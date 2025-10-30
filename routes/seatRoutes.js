const express = require('express');
const router = express.Router();
const SeatModel = require('../models/seatModel');

// 获取所有座位
router.get('/', async (req, res) => {
    try {
        const seats = await SeatModel.getAllSeats();
        res.json({
            success: true,
            data: seats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取座位列表失败',
            error: error.message
        });
    }
});

// 获取所有区域
router.get('/areas', async (req, res) => {
    try {
        const areas = await SeatModel.getAreas();
        res.json({
            success: true,
            data: areas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取区域列表失败',
            error: error.message
        });
    }
});

// 获取可用座位
router.get('/available', async (req, res) => {
    try {
        const { date, start_time, end_time } = req.query;
        
        if (!date || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: '请提供日期和时间段'
            });
        }

        const seats = await SeatModel.getAvailableSeats(date, start_time, end_time);
        res.json({
            success: true,
            data: seats,
            count: seats.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取可用座位失败',
            error: error.message
        });
    }
});

// 获取单个座位
router.get('/:id', async (req, res) => {
    try {
        const seat = await SeatModel.getSeatById(req.params.id);
        if (!seat) {
            return res.status(404).json({
                success: false,
                message: '座位不存在'
            });
        }
        res.json({
            success: true,
            data: seat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取座位信息失败',
            error: error.message
        });
    }
});

// 根据区域获取座位
router.get('/area/:area', async (req, res) => {
    try {
        const seats = await SeatModel.getSeatsByArea(req.params.area);
        res.json({
            success: true,
            data: seats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取座位失败',
            error: error.message
        });
    }
});

// 根据楼层获取座位
router.get('/floor/:floor', async (req, res) => {
    try {
        const seats = await SeatModel.getSeatsByFloor(req.params.floor);
        res.json({
            success: true,
            data: seats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取座位失败',
            error: error.message
        });
    }
});

// 创建座位
router.post('/', async (req, res) => {
    try {
        const seatId = await SeatModel.createSeat(req.body);
        res.status(201).json({
            success: true,
            message: '座位创建成功',
            data: { id: seatId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建座位失败',
            error: error.message
        });
    }
});

// 更新座位
router.put('/:id', async (req, res) => {
    try {
        const affectedRows = await SeatModel.updateSeat(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '座位不存在'
            });
        }
        res.json({
            success: true,
            message: '座位更新成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新座位失败',
            error: error.message
        });
    }
});

// 删除座位
router.delete('/:id', async (req, res) => {
    try {
        const affectedRows = await SeatModel.deleteSeat(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '座位不存在'
            });
        }
        res.json({
            success: true,
            message: '座位删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除座位失败',
            error: error.message
        });
    }
});

module.exports = router;

