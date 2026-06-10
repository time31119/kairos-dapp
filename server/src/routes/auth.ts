import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// 模拟用户数据库
const users: Map<string, { id: string; phone: string; email: string; password: string; createdAt: string }> = new Map();

// 验证码存储 (生产环境应使用 Redis)
const verificationCodes: Map<string, { code: string; expiresAt: number }> = new Map();

// 登录注册请求验证 schema
const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  code: z.string().length(6, '验证码为6位'),
  password: z.string().min(6, '密码至少6位'),
});

const sendCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
});

// 发送验证码
router.post('/auth/send-code', async (req, res) => {
  try {
    const { phone } = sendCodeSchema.parse(req.body);
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟有效期
    
    // 存储验证码
    verificationCodes.set(phone, { code, expiresAt });
    
    // 模拟发送验证码（实际应接入短信服务）
    console.log(`[SMS Mock] 验证码 ${code} 已发送至 ${phone}`);
    
    res.json({
      code: 0,
      message: '验证码已发送',
      data: { expiresIn: 300 } // 5分钟
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.issues[0].message });
    } else {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
});

// 注册
router.post('/auth/register', async (req, res) => {
  try {
    const { phone, code, password } = registerSchema.parse(req.body);
    
    // 验证验证码
    const stored = verificationCodes.get(phone);
    if (!stored || stored.code !== code) {
      return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
    }
    if (Date.now() > stored.expiresAt) {
      return res.status(400).json({ code: 400, message: '验证码已过期' });
    }
    
    // 检查用户是否已存在
    if ([...users.values()].some(u => u.phone === phone)) {
      return res.status(400).json({ code: 400, message: '该手机号已注册' });
    }
    
    // 创建用户
    const userId = `user_${Date.now()}`;
    const user = {
      id: userId,
      phone,
      email: '',
      password, // 生产环境必须加密存储
      createdAt: new Date().toISOString()
    };
    users.set(userId, user);
    
    // 删除已使用的验证码
    verificationCodes.delete(phone);
    
    // 生成模拟 token
    const token = `token_${userId}_${Date.now()}`;
    
    res.json({
      code: 0,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.issues[0].message });
    } else {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
});

// 登录
router.post('/auth/login', async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    
    // 查找用户
    const user = [...users.values()].find(u => u.phone === phone);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在，请先注册' });
    }
    
    // 验证密码
    if (user.password !== password) {
      return res.status(401).json({ code: 401, message: '密码错误' });
    }
    
    // 生成 token
    const token = `token_${user.id}_${Date.now()}`;
    
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.issues[0].message });
    } else {
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
});

// 获取用户信息
router.get('/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    
    const token = authHeader.substring(7);
    const match = token.match(/^token_(user_\d+)_\d+$/);
    if (!match) {
      return res.status(401).json({ code: 401, message: '无效的 token' });
    }
    
    const userId = match[1];
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    res.json({
      code: 0,
      data: {
        id: user.id,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 退出登录
router.post('/auth/logout', async (req, res) => {
  res.json({
    code: 0,
    message: '退出成功'
  });
});

export default router;
