import express from 'express';
import { getUserSubscription, createSubscription, updateSubscription, getSubscriptionPlans } from '../services/subscriptionService.js';

const router = express.Router();

// BSCScan API 配置
const BSCSCAN_API_KEY = 'SZF45F5REQV292FA7FXZ9BSVPJGF397XJW';
const BSCSCAN_BASE_URL = 'https://api.bscscan.com/api';
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955'; // USDT BEP20
const RECEIVE_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d';

// 订单存储（内存中，用于 Confirm Payment 流程）
const orders = new Map();

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

// 创建订阅订单 - 别名路由（兼容前端调用）
router.post('/create', async (req, res) => {
  try {
    const { planId, billingCycle, walletAddress } = req.body;
    
    if (!planId || !billingCycle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: planId, billingCycle' 
      });
    }

    const plans = getSubscriptionPlans();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const price = plan.price[billingCycle as keyof typeof plan.price];
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // 收款地址配置（TP钱包使用BEP20）
    const PAYMENT_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d';
    
    // 保存订单到内存
    const orderData = {
      orderId,
      planId,
      planName: plan.name,
      billingCycle,
      price,
      paymentAddress: PAYMENT_ADDRESS,
      walletAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.set(orderId, orderData);
    
    res.json({ 
      success: true, 
      orderId,
      data: orderData
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
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
    
    // 收款地址配置（TP钱包使用TRC20）
    const PAYMENT_ADDRESS = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d'; // USDT BEP20
    const PAYMENT_ADDRESS_BNB = '0x769ecB24694F56d75d6eaaD5F634d99eF12c407d'; // USDT BEP20
    
    // TP钱包默认使用BNB Chain (BEP20)
    let paymentAddress = PAYMENT_ADDRESS_BNB;
    let paymentChain = 'BEP20';

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
    const { orderId, paymentMethod, txHash, status, walletAddress, planId, billingCycle } = req.body;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    if (status === 'confirmed' && planId) {
      // 获取套餐信息
      const plans = getSubscriptionPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(400).json({ success: false, message: '无效的套餐' });
      }

      // 根据计费周期计算过期时间
      let days = 30;
      if (billingCycle === 'quarterly') days = 90;
      else if (billingCycle === 'yearly') days = 365;

      // 创建/更新订阅
      createSubscription(userId, {
        plan: planId,
        status: 'active',
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      });

      console.log(`[订阅] 用户 ${userId} 订阅成功 - 套餐: ${plan.name}, 周期: ${billingCycle}, 到期: ${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()}`);

      res.json({ 
        success: true, 
        message: '支付确认成功',
        data: {
          plan: plan.name,
          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    } else {
      res.json({ success: false, message: '支付未确认' });
    }
  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.status(500).json({ success: false, message: '处理回调失败' });
  }
});

// BSCScan API 验证交易
async function verifyBSCTransaction(walletAddress: string, expectedAmount: number): Promise<{ valid: boolean; txHash?: string; message: string }> {
  try {
    // 将金额转换为最小单位 (USDT BEP20 有 18 位小数)
    const amountInWei = BigInt(Math.round(expectedAmount * 1e18));
    
    // 从 BSCScan API 获取钱包的交易列表
    const url = `${BSCSCAN_BASE_URL}?module=account&action=tokentx&contractaddress=${USDT_CONTRACT}&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${BSCSCAN_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json() as any;
    
    if (data.status !== '1' || !data.result || !Array.isArray(data.result)) {
      console.log('[Verify] BSCScan API error:', data.message || 'No transactions found');
      return { valid: false, message: 'Unable to verify transaction. Please try again or contact support.' };
    }
    
    // 查找符合条件的交易
    for (const tx of data.result) {
      // 检查是否转入收款地址
      if (tx.to && tx.to.toLowerCase() !== RECEIVE_ADDRESS.toLowerCase()) {
        continue;
      }
      
      // 检查是否从用户钱包转出
      if (tx.from && tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
        continue;
      }
      
      // 检查金额 (value 是 hex string，需要转换)
      const txValue = BigInt(tx.value);
      if (txValue < amountInWei) {
        continue;
      }
      
      // 检查交易状态 (1 = success)
      if (tx.status !== '1') {
        continue;
      }
      
      // 找到有效交易
      console.log('[Verify] Valid transaction found:', tx.hash, 'Amount:', tx.value);
      return { 
        valid: true, 
        txHash: tx.hash, 
        message: 'Transaction verified successfully' 
      };
    }
    
    console.log('[Verify] No valid transaction found for wallet:', walletAddress, 'expected amount:', expectedAmount);
    return { valid: false, message: 'No valid USDT transaction found. Please make sure you have transferred the correct amount.' };
    
  } catch (error) {
    console.error('[Verify] Error verifying transaction:', error);
    return { valid: false, message: 'Network error during verification. Please try again.' };
  }
}

// Confirm Payment - 用户完成链上转账后确认（真实交易验证）
router.post('/confirm', async (req, res) => {
  try {
    const { orderId, walletAddress } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameter: orderId' 
      });
    }

    // 查找订单
    const order = orders.get(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.status === 'completed') {
      return res.json({ 
        success: true, 
        message: 'Payment already confirmed',
        data: { status: 'completed' }
      });
    }

    // 验证钱包地址（如果提供）
    if (walletAddress && order.walletAddress && walletAddress.toLowerCase() !== order.walletAddress.toLowerCase()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet address mismatch' 
      });
    }

    // 验证区块链上的真实交易
    const verification = await verifyBSCTransaction(
      walletAddress || order.walletAddress, 
      order.price
    );
    
    if (!verification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: verification.message 
      });
    }

    // 交易验证通过，更新订单状态
    order.status = 'completed';
    order.confirmedAt = new Date().toISOString();
    order.txHash = verification.txHash;
    orders.set(orderId, order);

    // 获取套餐信息，计算过期时间
    const plans = getSubscriptionPlans();
    const plan = plans.find(p => p.id === order.planId);
    
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    // 根据计费周期计算过期时间
    let days = 30;
    if (order.billingCycle === 'quarterly') days = 90;
    else if (order.billingCycle === 'yearly') days = 365;

    // 订阅时长映射
    const durationMap: Record<string, string> = {
      monthly: '月',
      quarterly: '季',
      yearly: '年'
    };

    // 创建/更新订阅（使用钱包地址作为用户标识）
    const userId = walletAddress || order.walletAddress || 'anonymous';
    createSubscription(userId, {
      plan: order.planId,
      status: 'active',
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    });

    console.log(`[Confirm] Payment verified for order ${orderId}, txHash: ${verification.txHash}, user ${userId} subscribed to ${plan.name}`);

    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      data: {
        orderId,
        plan: plan.name,
        planId: order.planId,
        billingCycle: order.billingCycle,
        duration: durationMap[order.billingCycle] || '月',
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        txHash: verification.txHash
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// 查询订单状态
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ 
      success: true, 
      data: {
        orderId: order.orderId,
        planId: order.planId,
        planName: order.planName,
        billingCycle: order.billingCycle,
        price: order.price,
        status: order.status,
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get order status' });
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

// 激活订阅
router.post('/activate', async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    if (!planId) {
      res.status(400).json({ success: false, message: '缺少套餐参数' });
      return;
    }
    
    // 根据计费周期计算过期时间
    let days = 30;
    if (billingCycle === 'quarterly') days = 90;
    else if (billingCycle === 'yearly') days = 365;
    
    // 订阅时长映射
    const durationMap: Record<string, string> = {
      monthly: '月',
      quarterly: '季',
      yearly: '年'
    };
    
    createSubscription(userId, {
      plan: planId,
      status: 'active',
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    });
    
    res.json({ 
      success: true, 
      message: '会员开通成功',
      data: {
        plan: planId,
        duration: durationMap[billingCycle] || '月',
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '开通会员失败' });
  }
});

export default router;
