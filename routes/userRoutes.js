const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');

// 获取所有用户
router.get('/', async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户列表失败',
            error: error.message
        });
    }
});

// 获取单个用户
router.get('/:id', async (req, res) => {
    try {
        const user = await UserModel.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取用户信息失败',
            error: error.message
        });
    }
});

// 创建用户
router.post('/', async (req, res) => {
    try {
        const userId = await UserModel.createUser(req.body);
        res.status(201).json({
            success: true,
            message: '用户创建成功',
            data: { id: userId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建用户失败',
            error: error.message
        });
    }
});

// 更新用户
router.put('/:id', async (req, res) => {
    try {
        const affectedRows = await UserModel.updateUser(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        res.json({
            success: true,
            message: '用户更新成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新用户失败',
            error: error.message
        });
    }
});

// 删除用户
router.delete('/:id', async (req, res) => {
    try {
        const affectedRows = await UserModel.deleteUser(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        res.json({
            success: true,
            message: '用户删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除用户失败',
            error: error.message
        });
    }
});

module.exports = router;

