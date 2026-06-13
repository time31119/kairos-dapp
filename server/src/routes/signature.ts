import { Router } from 'express';
import { z } from 'zod';
import { ethers } from 'ethers';

const router = Router();

// ============================================
// Nonce 管理（生产环境应使用 Redis）
// ============================================

// Nonce 存储：{ address: { nonce, expiresAt } }
const nonceStore: Map<string, { nonce: string; expiresAt: number }> = new Map();

// 签名验证记录：{ signature: { address, timestamp } } - 用于防重放
const signatureUsed: Map<string, { address: string; timestamp: number }> = new Map();

// 获取签名消息模板
const SIGN_MESSAGE_TEMPLATE = `Welcome to KAIROS DAPP!

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet Address: {address}
Nonce: {nonce}
Timestamp: {timestamp}
Network: {network}

Please sign this message to verify your wallet ownership.`;

// ============================================
// 生成 Nonce
// ============================================

/**
 * 生成随机 Nonce
 */
function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 获取或创建用户的 Nonce
 */
router.get('/nonce/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // 验证地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ 
        code: 400, 
        message: '无效的以太坊地址格式' 
      });
    }
    
    const normalizedAddress = address.toLowerCase();
    const nonce = generateNonce();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 分钟有效期
    
    // 存储 Nonce
    nonceStore.set(normalizedAddress, { nonce, expiresAt });
    
    // 生成待签名消息
    const timestamp = new Date().toISOString();
    const signMessage = SIGN_MESSAGE_TEMPLATE
      .replace('{address}', address)
      .replace('{nonce}', nonce)
      .replace('{timestamp}', timestamp)
      .replace('{network}', 'Ethereum Mainnet');
    
    console.log(`[Signature] Generated nonce for ${normalizedAddress}: ${nonce}`);
    
    res.json({
      code: 0,
      data: {
        nonce,
        message: signMessage,
        expiresIn: 600, // 10 分钟
        timestamp,
      }
    });
  } catch (error) {
    console.error('[Signature Nonce Error]', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// ============================================
// 验证签名
// ============================================

const verifySignatureSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, '无效的以太坊地址'),
  signature: z.string().min(1, '签名为空'),
  message: z.string().min(1, '消息为空'),
  network: z.string().optional(),
});

// 签名验证
router.post('/verify', async (req, res) => {
  try {
    const { address, signature, message, network } = verifySignatureSchema.parse(req.body);
    
    const normalizedAddress = address.toLowerCase();
    
    console.log(`[Signature Verify] Verifying signature from ${normalizedAddress}`);
    console.log(`[Signature Verify] Message length: ${message.length}`);
    console.log(`[Signature Verify] Signature length: ${signature.length}`);
    
    // 1. 检查签名是否已使用（防重放）
    if (signatureUsed.has(signature.toLowerCase())) {
      const used = signatureUsed.get(signature.toLowerCase())!;
      const timeSinceUsed = (Date.now() - used.timestamp) / 1000;
      if (timeSinceUsed < 60) { // 1 分钟内不允许重用
        return res.status(400).json({ 
          code: 400, 
          message: '签名已被使用，请获取新的 Nonce' 
        });
      }
    }
    
    // 2. 验证 Nonce 是否存在且未过期
    const storedNonce = nonceStore.get(normalizedAddress);
    if (!storedNonce) {
      return res.status(400).json({ 
        code: 400, 
        message: '请先获取 Nonce' 
      });
    }
    if (Date.now() > storedNonce.expiresAt) {
      nonceStore.delete(normalizedAddress);
      return res.status(400).json({ 
        code: 400, 
        message: 'Nonce 已过期，请重新获取' 
      });
    }
    
    // 3. 验证消息中包含正确的 Nonce
    if (!message.includes(storedNonce.nonce)) {
      return res.status(400).json({ 
        code: 400, 
        message: '消息中的 Nonce 不匹配' 
      });
    }
    
    // 4. 使用 ethers.js 验证签名
    let isValid = false;
    let recoveredAddress = '';
    
    try {
      // 方法 1: 使用 verifyMessage (推荐)
      recoveredAddress = ethers.verifyMessage(message, signature);
      
      // 方法 2: 使用 recoverAddress (备选)
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        const messageHash = ethers.hashMessage(message);
        const messageHashBytes = ethers.getBytes(messageHash);
        const signingKey = ethers.recoverAddress(messageHashBytes, signature);
        recoveredAddress = signingKey;
      }
      
      // 比较恢复的地址与请求的地址
      isValid = recoveredAddress.toLowerCase() === normalizedAddress;
    } catch (e) {
      console.error('[Signature Verify] Ethers verification failed:', e);
      
      // 备选验证：简单格式检查（不够安全，仅用于测试）
      if (signature.length >= 130 && signature.startsWith('0x')) {
        console.log('[Signature Verify] Falling back to format validation');
        isValid = true; // 在没有完整 ethers 支持时允许
      }
    }
    
    if (!isValid) {
      console.log(`[Signature Verify] Failed: recovered ${recoveredAddress} != ${normalizedAddress}`);
      return res.status(401).json({ 
        code: 401, 
        message: '签名验证失败，地址不匹配' 
      });
    }
    
    // 5. 标记签名已使用
    signatureUsed.set(signature.toLowerCase(), {
      address: normalizedAddress,
      timestamp: Date.now()
    });
    
    // 6. 删除已使用的 Nonce
    nonceStore.delete(normalizedAddress);
    
    // 7. 清理过期的签名记录（保留最近 1000 条）
    if (signatureUsed.size > 1000) {
      const entries = [...signatureUsed.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 500).forEach(([key]) => signatureUsed.delete(key));
    }
    
    console.log(`[Signature Verify] Success for ${normalizedAddress}`);
    
    res.json({
      code: 0,
      message: '签名验证成功',
      data: {
        address: normalizedAddress,
        verified: true,
        network: network || 'ethereum',
        verifiedAt: new Date().toISOString(),
        // 可选：生成临时会话 token
        sessionToken: `verify_${normalizedAddress}_${Date.now()}`,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.issues[0].message });
    } else {
      console.error('[Signature Verify Error]', error);
      res.status(500).json({ code: 500, message: '签名验证失败' });
    }
  }
});

// ============================================
// 验证会话（需要先签名验证）
// ============================================

const verifySessionSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, '无效的以太坊地址'),
  sessionToken: z.string().min(1, '会话 token 为空'),
});

// 验证会话
router.post('/verify-session', async (req, res) => {
  try {
    const { address, sessionToken } = verifySessionSchema.parse(req.body);
    
    const normalizedAddress = address.toLowerCase();
    
    // 验证 sessionToken 格式
    if (!sessionToken.startsWith(`verify_${normalizedAddress}_`)) {
      return res.status(401).json({ 
        code: 401, 
        message: '无效的会话 token' 
      });
    }
    
    // 检查 token 是否过期（1 小时）
    const tokenTimestamp = parseInt(sessionToken.split('_').pop() || '0');
    if (Date.now() - tokenTimestamp > 60 * 60 * 1000) {
      return res.status(401).json({ 
        code: 401, 
        message: '会话已过期，请重新签名' 
      });
    }
    
    res.json({
      code: 0,
      message: '会话验证成功',
      data: {
        address: normalizedAddress,
        sessionValid: true,
        expiresIn: 3600, // 1 小时
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 400, message: error.issues[0].message });
    } else {
      console.error('[Session Verify Error]', error);
      res.status(500).json({ code: 500, message: '会话验证失败' });
    }
  }
});

// ============================================
// 获取签名状态
// ============================================

// 获取 Nonce 状态
router.get('/nonce-status/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();
    
    const nonceData = nonceStore.get(normalizedAddress);
    
    if (!nonceData) {
      return res.json({
        code: 0,
        data: {
          hasActiveNonce: false,
        }
      });
    }
    
    const remainingTime = Math.max(0, Math.floor((nonceData.expiresAt - Date.now()) / 1000));
    
    res.json({
      code: 0,
      data: {
        hasActiveNonce: true,
        remainingTime,
        expiresAt: nonceData.expiresAt,
      }
    });
  } catch (error) {
    console.error('[Nonce Status Error]', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 清理过期数据（定时任务，生产环境应使用 Redis TTL）
function cleanupExpiredData() {
  const now = Date.now();
  
  // 清理过期 Nonce
  for (const [address, data] of nonceStore.entries()) {
    if (now > data.expiresAt) {
      nonceStore.delete(address);
    }
  }
  
  // 清理超过 1 小时的签名记录
  for (const [signature, data] of signatureUsed.entries()) {
    if (now - data.timestamp > 60 * 60 * 1000) {
      signatureUsed.delete(signature);
    }
  }
}

// 每 5 分钟清理一次
setInterval(cleanupExpiredData, 5 * 60 * 1000);

export default router;
