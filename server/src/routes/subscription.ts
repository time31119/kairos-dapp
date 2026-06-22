/**
 * 订阅管理路由
 */
import express from 'express';
import {
  getUserSubscription,
  getUserOrders,
  createSubscription,
  confirmSubscription,
  cancelSubscription,
  upgradeSubscription,
  monitorPayment,
  getSubscriptionStats,
  PAYMENT_ADDRESS,
  PRICING,
  BENEFITS,
  SubscriptionTier,
  SubscriptionStatus,
} from '../services/subscription-service';

const router = express.Router();

// ==================== 公开接口 ====================

/**
 * 获取订阅方案信息
 */
router.get('/plans', (_req, res) => {
  try {
    const plans = Object.values(SubscriptionTier).map((tier) => ({
      tier,
      name: BENEFITS[tier].name,
      price: PRICING[tier],
      benefits: BENEFITS[tier].items,
    }));
    
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取支付地址
 */
router.get('/payment-address', (_req, res) => {
  try {
    res.json({ success: true, data: { address: PAYMENT_ADDRESS } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取订阅统计数据
 */
router.get('/stats', async (_req, res) => {
  try {
    const stats = await getSubscriptionStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 需要钱包地址的接口 ====================

/**
 * 获取用户当前订阅状态
 */
router.get('/current', async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    if (!walletAddress) {
      return res.status(401).json({ success: false, message: '缺少钱包地址' });
    }
    
    const subscription = await getUserSubscription(walletAddress);
    const isActive = subscription?.status === SubscriptionStatus.ACTIVE && 
                     subscription?.expire_at && 
                     new Date(subscription.expire_at) > new Date();
    
    res.json({
      success: true,
      data: {
        hasActive: !!isActive,
        subscription: subscription || null,
        tier: subscription?.tier || null,
        status: subscription?.status || null,
        expireAt: subscription?.expire_at || null,
        activatedAt: subscription?.activated_at || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取用户订单列表
 */
router.get('/orders', async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    if (!walletAddress) {
      return res.status(401).json({ success: false, message: '缺少钱包地址' });
    }
    
    const orders = await getUserOrders(walletAddress);
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 创建新订单
 */
router.post('/create', async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    if (!walletAddress) {
      return res.status(401).json({ success: false, message: '缺少钱包地址' });
    }
    
    const { tier, paymentMethod } = req.body;
    
    if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
      return res.status(400).json({ success: false, message: '无效的订阅方案' });
    }
    
    // 注意：txHash需要在支付完成后由客户端调用 confirm-payment 接口确认
    const order = await createSubscription(walletAddress, tier as SubscriptionTier, '');
    
    res.json({
      success: true,
      data: {
        orderId: order.id,
        walletAddress: PAYMENT_ADDRESS,
        amount: PRICING[tier as SubscriptionTier],
        tier,
        status: order.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 确认支付
 */
router.post('/confirm', async (req, res) => {
  try {
    const { txHash } = req.body;
    
    if (!txHash) {
      return res.status(400).json({ success: false, message: '缺少交易哈希' });
    }
    
    const result = await confirmSubscription(txHash);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 监听支付
 */
router.post('/monitor', async (req, res) => {
  try {
    const { txHash } = req.body;
    
    if (!txHash) {
      return res.status(400).json({ success: false, message: '缺少交易哈希' });
    }
    
    const result = await monitorPayment(txHash);
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 取消订阅
 */
router.post('/cancel', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ success: false, message: '缺少订单ID' });
    }
    
    const result = await cancelSubscription(orderId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 升级订阅
 */
router.post('/upgrade', async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'] as string;
    if (!walletAddress) {
      return res.status(401).json({ success: false, message: '缺少钱包地址' });
    }
    
    const { newTier } = req.body;
    
    if (!newTier) {
      return res.status(400).json({ success: false, message: '缺少新订阅方案' });
    }
    
    if (!Object.values(SubscriptionTier).includes(newTier)) {
      return res.status(400).json({ success: false, message: '无效的订阅方案' });
    }
    
    const result = await upgradeSubscription(walletAddress, newTier, '');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
