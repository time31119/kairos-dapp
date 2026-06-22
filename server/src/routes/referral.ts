import { Router } from 'express';
import { query } from 'express-validator';
import { supabase } from '../services/supabase';

const router = Router();

// 模拟数据存储（仅用于推荐记录）
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

// 缓存用户邀请数据（仅用于内存缓存）
const userReferralsCache: Record<string, {
  inviteCode?: string;
  totalReward: number;
  directReward: number;
  monthlySupportReward: number;
  monthlyStats: Record<string, { totalSubscription: number; extraReward: number }>;
}> = {};

// 基于用户ID生成固定的邀请码
function generateInviteCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
}

// 从Supabase获取用户邀请码
async function getInviteCodeFromDB(userId: string): Promise<string | null> {
  try {
    if (supabase) {
      const { data } = await supabase
        .from('users')
        .select('invite_code')
        .eq('id', userId)
        .single();
      return data?.invite_code || null;
    }
  } catch (error) {
    console.error('Error fetching invite code from DB:', error);
  }
  return null;
}

// 保存邀请码到Supabase
async function saveInviteCodeToDB(userId: string, inviteCode: string): Promise<boolean> {
  try {
    if (supabase) {
      const { error } = await supabase
        .from('users')
        .update({ invite_code: inviteCode })
        .eq('id', userId);
      if (error) {
        console.error('Error saving invite code:', error);
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('Error saving invite code to DB:', error);
  }
  return false;
}

// 获取用户邀请信息
router.get('/info', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // 优先从数据库获取邀请码
  let inviteCode = await getInviteCodeFromDB(userId as string);
  
  // 如果数据库没有邀请码，生成并保存
  if (!inviteCode) {
    inviteCode = generateInviteCode(userId as string);
    await saveInviteCodeToDB(userId as string, inviteCode);
  }

  // 更新内存缓存
  if (!userReferralsCache[userId as string]) {
    userReferralsCache[userId as string] = {
      totalReward: 0,
      directReward: 0,
      monthlySupportReward: 0,
      monthlyStats: {}
    };
  }
  userReferralsCache[userId as string].inviteCode = inviteCode;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyStat = userReferralsCache[userId as string].monthlyStats[currentMonth] || { totalSubscription: 0, extraReward: 0 };
  
  res.json({
    success: true,
    data: {
      inviteCode: inviteCode,
      totalReward: userReferralsCache[userId as string].totalReward,
      directReward: userReferralsCache[userId as string].directReward,
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

// 获取邀请链接
router.get('/link', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  // 使用用户ID生成固定的邀请码
  const inviteCode = generateInviteCode(userId as string);
  const inviteLink = `https://kairosdapp.com/register?code=${inviteCode}`;
  
  res.json({
    success: true,
    data: {
      inviteCode,
      inviteLink,
    }
  });
});

export default router;
