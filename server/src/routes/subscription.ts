import express from 'express';
import { getUserSubscription, createSubscription, updateSubscription, getSubscriptionPlans } from '../services/subscriptionService.js';

const router = express.Router();

// 获取订阅套餐列表
router.get('/plans', (req, res) => {
  const plans = getSubscriptionPlans();
  res.json({ success: true, data: plans });
});

// 获取用户当前订阅状态
router.get('/status', async (req, res) => {
  try {
    // 从 header 获取用户标识（简化版，实际应从 session 获取）
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const subscription = getUserSubscription(userId);
    
    res.json({ 
      success: true, 
      data: {
        isSubscribed: subscription?.status === 'active',
        plan: subscription?.plan,
        expiresAt: subscription?.expiresAt,
        status: subscription?.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取订阅状态失败' });
  }
});

// 创建订阅订单
router.post('/create-order', async (req, res) => {
  try {
    const { planId, billingCycle, paymentMethod } = req.body;
    
    if (!planId || !billingCycle || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数：planId, billingCycle, paymentMethod' 
      });
    }

    const plans = getSubscriptionPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(400).json({ success: false, message: '无效的套餐' });
    }

    const price = plan.price[billingCycle as keyof typeof plan.price];
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // 生成支付地址（根据支付方式）
    // 收款地址配置
    const PAYMENT_ADDRESSES = {
      USDT_TRC20: 'TRX_ADDRESS_PENDING',
      ETH: 'ETH_ADDRESS_PENDING',
      BNB: '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d', // BNB Chain (BEP20)
    };
    
    let paymentAddress = PAYMENT_ADDRESSES[paymentMethod as keyof typeof PAYMENT_ADDRESSES] || 'PAYMENT_ADDRESS_PENDING';

    const order = {
      orderId,
      planId,
      planName: plan.name,
      billingCycle,
      price,
      paymentMethod,
      paymentAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      data: order,
      message: '订单创建成功'
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ success: false, message: '创建订单失败' });
  }
});

// 模拟支付回调（实际项目中由支付网关调用）
router.post('/callback', async (req, res) => {
  try {
    const { orderId, paymentMethod, txHash, status } = req.body;
    
    if (status === 'confirmed') {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      
      // 获取订单信息（实际应从数据库查询）
      const plans = getSubscriptionPlans();
      
      // 创建/更新订阅
      createSubscription(userId, {
        plan: 'professional',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      res.json({ success: true, message: '支付确认成功' });
    } else {
      res.json({ success: false, message: '支付未确认' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '处理回调失败' });
  }
});

// 取消订阅
router.post('/cancel', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    updateSubscription(userId, { status: 'cancelled' });
    
    res.json({ success: true, message: '订阅已取消' });
  } catch (error) {
    res.status(500).json({ success: false, message: '取消订阅失败' });
  }
});

export default router;
