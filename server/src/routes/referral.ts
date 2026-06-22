import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';

const router = Router();

// 模拟数据存储
const referralRecords: Array<{
  id: string;
  referrerId: string;
  refereeId: string;
  refereeWallet: string;
  packageType: string;
  packagePrice: number;
  rewardAmount: number;
  rewardPercentage: number;
  status: 'pending' | 'paid' | 'settled';
  createdAt: string;
  settledAt?: string;
}> = [];

const userReferrals: Record<string, {
  inviteCode?: string;
  totalReward: number;
  directReward: number;
  monthlySupportReward: number;
  monthlyStats: Record<string, { totalSubscription: number; extraReward: number }>;
}> = {};

// 获取用户邀请信息
router.get('/info', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  const userData = userReferrals[userId as string] || {
    totalReward: 0,
    directReward: 0,
    monthlySupportReward: 0,
    monthlyStats: {}
  };
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyStat = userData.monthlyStats[currentMonth] || { totalSubscription: 0, extraReward: 0 };
  
  // 生成唯一的邀请码：KAI- + 6位大写字母数字
  // 生成唯一的邀请码：基于用户ID的固定哈希值
  const generateInviteCode = (userId: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    // 基于userId生成固定哈希
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    let code = 'KAI-';
    for (let i = 0; i < 6; i++) {
      hash = ((hash << 5) - hash) + i;
      code += chars.charAt(Math.abs(hash) % chars.length);
    }
    return code;
  };
  
  // 检查是否已有邀请码，没有则基于userId生成
  const storedCode = userData.inviteCode || generateInviteCode(userId as string);
  if (!userData.inviteCode) {
    userData.inviteCode = storedCode;
  }
  
  res.json({
    success: true,
    data: {
      inviteCode: storedCode,
      totalReward: userData.totalReward,
      directReward: userData.directReward,
      monthlySupportReward: monthlyStat.extraReward,
      monthlyTotalSubscription: monthlyStat.totalSubscription,
      totalReferrals: referralRecords.filter(r => r.referrerId === userId).length,
    }
  });
});

// 获取推荐记录
router.get('/records', (req, res) => {
  const { userId, page = '1', limit = '10' } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  const userRecords = referralRecords
    .filter(r => r.referrerId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;
  
  res.json({
    success: true,
    data: {
      records: userRecords.slice(start, end).map(r => ({
        id: r.id,
        refereeWallet: r.refereeWallet.slice(0, 6) + '...' + r.refereeWallet.slice(-4),
        packageType: r.packageType,
        packagePrice: r.packagePrice,
        rewardAmount: r.rewardAmount,
        status: r.status,
        createdAt: r.createdAt,
      })),
      total: userRecords.length,
      page: pageNum,
      limit: limitNum,
    }
  });
});

// 订阅时自动分佣
router.post('/subscribe-reward',
  body('userId').isString().notEmpty(),
  body('userPackage').isString().isIn(['basic', 'pro', 'vip']),
  body('subscriptionAmount').isNumeric(),
  body('refereeWallet').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { userId, userPackage, subscriptionAmount, refereeWallet } = req.body;
    
    // 如果有推荐人，计算并分发奖励
    if (refereeWallet && refereeWallet !== '0x0000000000000000000000000000000000000000') {
      // 查找推荐人的奖励比例（根据推荐人的套餐等级）
      // 这里简化处理，默认使用15%基础比例
      const rewardPercentage = 0.15;
      const rewardAmount = subscriptionAmount * rewardPercentage;
      
      // 创建推荐记录
      const record = {
        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        referrerId: refereeWallet,
        refereeId: userId,
        refereeWallet: userId,
        packageType: userPackage,
        packagePrice: subscriptionAmount,
        rewardAmount,
        rewardPercentage,
        status: 'paid' as const,
        createdAt: new Date().toISOString(),
        settledAt: new Date().toISOString(),
      };
      
      referralRecords.push(record);
      
      // 更新推荐人统计
      if (!userReferrals[refereeWallet]) {
        userReferrals[refereeWallet] = {
          totalReward: 0,
          directReward: 0,
          monthlySupportReward: 0,
          monthlyStats: {}
        };
      }
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (!userReferrals[refereeWallet].monthlyStats[currentMonth]) {
        userReferrals[refereeWallet].monthlyStats[currentMonth] = { totalSubscription: 0, extraReward: 0 };
      }
      
      userReferrals[refereeWallet].totalReward += rewardAmount;
      userReferrals[refereeWallet].directReward += rewardAmount;
      userReferrals[refereeWallet].monthlyStats[currentMonth].totalSubscription += subscriptionAmount;
      
      // 计算月度推广支持奖励
      const monthlyTotal = userReferrals[refereeWallet].monthlyStats[currentMonth].totalSubscription;
      let extraPercentage = 0;
      if (monthlyTotal >= 150000) extraPercentage = 0.10;
      else if (monthlyTotal >= 50000) extraPercentage = 0.08;
      else if (monthlyTotal >= 15000) extraPercentage = 0.06;
      else if (monthlyTotal >= 5000) extraPercentage = 0.04;
      else if (monthlyTotal >= 2000) extraPercentage = 0.02;
      
      const extraReward = (monthlyTotal * extraPercentage) - userReferrals[refereeWallet].directReward;
      if (extraReward > 0) {
        userReferrals[refereeWallet].monthlySupportReward += extraReward;
        userReferrals[refereeWallet].monthlyStats[currentMonth].extraReward = extraReward;
      }
      
      return res.json({
        success: true,
        data: {
          rewardDistributed: true,
          rewardAmount,
          rewardPercentage,
          referrer: refereeWallet.slice(0, 6) + '...' + refereeWallet.slice(-4),
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        rewardDistributed: false,
        rewardAmount: 0,
      }
    });
  }
);

// 月底结算推广支持奖励（定时任务调用）
router.post('/settle-monthly-rewards', async (req, res) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  let totalSettled = 0;
  
  for (const userId in userReferrals) {
    const monthlyStat = userReferrals[userId].monthlyStats[currentMonth];
    if (monthlyStat && monthlyStat.extraReward > 0) {
      totalSettled += monthlyStat.extraReward;
      
      // 标记为已结算
      const userRecords = referralRecords.filter(r => r.referrerId === userId);
      userRecords.forEach(r => {
        if (r.status === 'pending') {
          r.status = 'settled';
          r.settledAt = new Date().toISOString();
        }
      });
    }
  }
  
  res.json({
    success: true,
    data: {
      settledUsers: Object.keys(userReferrals).length,
      totalSettled,
      month: currentMonth,
    }
  });
});

export default router;
