import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '@/components/Screen';

// Reusable Card Component
function NeonCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(10, 10, 15, 0.9)',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(0, 240, 255, 0.3)',
          padding: 16,
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Slider Component
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  color = '#00F0FF',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: string;
  onChange: (val: number) => void;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={{ marginVertical: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: '#888', fontSize: 14 }}>{label}</Text>
        <Text style={{ color: color, fontSize: 16, fontWeight: 'bold' }}>
          {value}
          {unit}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ color: '#555', fontSize: 10 }}>{min}{unit}</Text>
        <Text style={{ color: '#555', fontSize: 10 }}>{max}{unit}</Text>
      </View>
    </View>
  );
}

export default function CopySettingsPage() {
  const [copyRatio, setCopyRatio] = useState(30); // 跟单比例 10-100%
  const [stopLoss, setStopLoss] = useState(10); // 止损 5-50%
  const [takeProfit, setTakeProfit] = useState(30); // 止盈 10-100%
  const [maxAmount, setMaxAmount] = useState(1000); // 最大跟单金额
  const [autoCopy, setAutoCopy] = useState(true); // 自动跟单开关
  const [singleTrade, setSingleTrade] = useState(false); // 单笔独立跟单

  const handleConfirm = () => {
    Alert.alert(
      '跟单设置成功',
      `您已成功设置跟单参数：\n跟单比例：${copyRatio}%\n止损：${stopLoss}%\n止盈：${takeProfit}%`,
      [
        {
          text: '确定',
        },
      ]
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 240, 255, 0.2)',
        }}
      >
        <Link href="/copytrading">
          <TouchableOpacity style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ color: '#00F0FF', fontSize: 20 }}>←</Text>
          </TouchableOpacity>
        </Link>
        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>跟单设置</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Trader Info */}
        <NeonCard>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(0, 240, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#00F0FF',
              }}
            >
              <Text style={{ fontSize: 20, color: '#00F0FF' }}>神</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>币神张三</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                分润比例 10% · 跟单人数 2,341
              </Text>
            </View>
          </View>
        </NeonCard>

        {/* Copy Ratio */}
        <NeonCard>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            跟单比例
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
            设置跟随该交易员开仓的仓位比例（不含本金）
          </Text>
          <Slider
            label=""
            value={copyRatio}
            min={10}
            max={100}
            unit="%"
            color="#00F0FF"
            onChange={setCopyRatio}
          />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ color: '#888', fontSize: 12, flex: 1 }}>预计跟单金额</Text>
            <Text style={{ color: '#00F0FF', fontSize: 14, fontWeight: 'bold' }}>
              {(10000 * copyRatio / 100).toFixed(0)} U
            </Text>
          </View>
        </NeonCard>

        {/* Stop Loss */}
        <NeonCard>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            止损设置
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
            当跟单亏损达到此比例时，自动平仓止损
          </Text>
          <Slider
            label=""
            value={stopLoss}
            min={5}
            max={50}
            unit="%"
            color="#FF4444"
            onChange={setStopLoss}
          />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ color: '#888', fontSize: 12, flex: 1 }}>止损金额</Text>
            <Text style={{ color: '#FF4444', fontSize: 14, fontWeight: 'bold' }}>
              -{(10000 * copyRatio / 100 * stopLoss / 100).toFixed(0)} U
            </Text>
          </View>
        </NeonCard>

        {/* Take Profit */}
        <NeonCard>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            止盈设置
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
            当跟单盈利达到此比例时，自动平仓止盈
          </Text>
          <Slider
            label=""
            value={takeProfit}
            min={10}
            max={100}
            unit="%"
            color="#00FF88"
            onChange={setTakeProfit}
          />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ color: '#888', fontSize: 12, flex: 1 }}>止盈金额</Text>
            <Text style={{ color: '#00FF88', fontSize: 14, fontWeight: 'bold' }}>
              +{(10000 * copyRatio / 100 * takeProfit / 100).toFixed(0)} U
            </Text>
          </View>
        </NeonCard>

        {/* Max Amount */}
        <NeonCard>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            最大跟单金额
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
            设置对该交易员的单次最大跟单金额上限
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                color: '#FFF',
                fontSize: 24,
                fontWeight: 'bold',
              }}
              value={maxAmount.toString()}
              onChangeText={(text) => setMaxAmount(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholderTextColor="#555"
            />
            <Text style={{ color: '#888', fontSize: 16 }}>U</Text>
          </View>
        </NeonCard>

        {/* Options */}
        <NeonCard>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>
            跟单选项
          </Text>

          <TouchableOpacity
            onPress={() => setAutoCopy(!autoCopy)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 14 }}>自动跟单</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                交易员开仓时自动同步跟单
              </Text>
            </View>
            <View
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: autoCopy ? '#00F0FF' : 'rgba(255,255,255,0.1)',
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: autoCopy ? '#000' : '#666',
                  alignSelf: autoCopy ? 'flex-end' : 'flex-start',
                }}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSingleTrade(!singleTrade)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 14 }}>单笔独立跟单</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                每笔跟单独立计算盈亏和止损
              </Text>
            </View>
            <View
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: singleTrade ? '#00F0FF' : 'rgba(255,255,255,0.1)',
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: singleTrade ? '#000' : '#666',
                  alignSelf: singleTrade ? 'flex-end' : 'flex-start',
                }}
              />
            </View>
          </TouchableOpacity>
        </NeonCard>

        {/* Risk Warning */}
        <View
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 100,
          }}
        >
          <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: 'bold' }}>风险提示</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 8, lineHeight: 18 }}>
            跟单交易存在较高风险，历史收益不代表未来表现。请根据自身风险承受能力合理设置跟单参数，本平台不对跟单亏损承担任何责任。
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(10, 10, 15, 0.98)',
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 34,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 240, 255, 0.2)',
        }}
      >
        <TouchableOpacity
          onPress={handleConfirm}
          style={{
            backgroundColor: '#00F0FF',
            borderRadius: 25,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
            确认跟单设置
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
