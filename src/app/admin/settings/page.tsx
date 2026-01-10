/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

interface ClubSettings {
  name: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  foundedYear: number;
  memberCount: number;
  website: string;
}

// 模拟社团设置数据
const MOCK_SETTINGS: ClubSettings = {
  name: '电脑社',
  description: '致力于推广计算机科学、编程和信息技术的社团。',
  email: 'contact@computerclub.com',
  phone: '13800138000',
  location: '创意中心 A01',
  foundedYear: 2020,
  memberCount: 156,
  website: 'https://computerclub.example.com',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<ClubSettings>(MOCK_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'api'>('basic');

  const handleSettingChange = (field: keyof ClubSettings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    // TODO: 保存到 Appwrite
  };

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">社团设置</h1>
        <p className="text-gray-400">管理社团信息、安全设置和 API 密钥。</p>
      </div>

      {/* 标签栏 */}
      <div className="mb-6 flex gap-2 border-b border-[#283946]">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'basic'
              ? 'border-[#137fec] text-[#137fec]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          基本信息
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-[#137fec] text-[#137fec]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          安全设置
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'api'
              ? 'border-[#137fec] text-[#137fec]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          API 设置
        </button>
      </div>

      {/* 基本信息标签 */}
      {activeTab === 'basic' && (
        <div className="space-y-6 max-w-3xl">
          {/* 社团名称 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <label htmlFor="name" className="block text-white font-semibold mb-3">
              社团名称
            </label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => handleSettingChange('name', e.target.value)}
              placeholder="输入社团名称..."
            />
          </div>

          {/* 社团描述 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <label htmlFor="description" className="block text-white font-semibold mb-3">
              社团描述
            </label>
            <textarea
              id="description"
              value={settings.description}
              onChange={(e) => handleSettingChange('description', e.target.value)}
              placeholder="输入社团描述..."
              rows={4}
              className="w-full bg-[#1f2d39] border border-[#283946] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#137fec] transition-colors resize-none"
            />
          </div>

          {/* 联系方式 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">联系方式</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-400 text-sm font-medium mb-2">
                  邮箱
                </label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-gray-400 text-sm font-medium mb-2">
                  电话
                </label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  placeholder="13800138000"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-gray-400 text-sm font-medium mb-2">
                  网站
                </label>
                <Input
                  id="website"
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleSettingChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* 其他信息 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">其他信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-gray-400 text-sm font-medium mb-2">
                  活动地点
                </label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) => handleSettingChange('location', e.target.value)}
                  placeholder="创意中心 A01"
                />
              </div>
              <div>
                <label htmlFor="foundedYear" className="block text-gray-400 text-sm font-medium mb-2">
                  成立年份
                </label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={settings.foundedYear}
                  onChange={(e) => handleSettingChange('foundedYear', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={handleSaveSettings}
              variant="primary"
              className="!bg-[#137fec] !hover:bg-[#0f5fcc]"
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '保存更改'}
            </Button>
            <Button variant="secondary">取消</Button>
          </div>
        </div>
      )}

      {/* 安全设置标签 */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl">
          {/* 修改密码 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">修改密码</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-gray-400 text-sm font-medium mb-2">
                  当前密码
                </label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="输入当前密码..."
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-gray-400 text-sm font-medium mb-2">
                  新密码
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="输入新密码..."
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-400 text-sm font-medium mb-2">
                  确认新密码
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="确认新密码..."
                />
              </div>
            </div>
            <Button 
              className="mt-4 !bg-[#137fec] !hover:bg-[#0f5fcc]" 
              variant="primary"
            >
              更新密码
            </Button>
          </div>

          {/* 两步验证 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">两步验证</h3>
              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">
                已启用
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              使用认证器应用程序增加帐户安全性。
            </p>
            <Button variant="secondary">管理设备</Button>
          </div>

          {/* 活跃会话 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">活跃会话</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#1f2d39] rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">当前设备 - Chrome</p>
                  <p className="text-gray-400 text-xs">192.168.1.1 - 中国</p>
                </div>
                <span className="text-xs text-green-400 font-medium">活跃</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1f2d39] rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">iPhone - Safari</p>
                  <p className="text-gray-400 text-xs">10.0.0.1 - 中国</p>
                </div>
                <button className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API 设置标签 */}
      {activeTab === 'api' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">API 密钥管理</h3>
            <p className="text-gray-400 text-sm mb-6">
              使用 API 密钥在程序中访问 API。请妥善保管密钥，不要在任何地方共享。
            </p>

            {/* 密钥列表 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-4 bg-[#1f2d39] rounded-lg border border-[#283946]">
                <div>
                  <p className="text-white text-sm font-medium mb-1">默认密钥</p>
                  <p className="text-gray-500 text-xs font-mono break-all">
                    sk_live_****************************
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-[#283946] text-gray-400 hover:text-white rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <button className="p-2 hover:bg-[#283946] text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 生成新密钥 */}
            <Button 
              variant="primary"
              className="!bg-[#137fec] !hover:bg-[#0f5fcc]"
            >
              生成新密钥
            </Button>
          </div>

          {/* Webhook 设置 */}
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Webhook 配置</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="webhookUrl" className="block text-gray-400 text-sm font-medium mb-2">
                  Webhook URL
                </label>
                <Input
                  id="webhookUrl"
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm font-medium">事件类型</p>
                <div className="space-y-2">
                  {['notice.published', 'activity.created', 'comment.posted'].map((event) => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="cursor-pointer" defaultChecked />
                      <span className="text-gray-300 text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <Button 
              className="mt-4 !bg-[#137fec] !hover:bg-[#0f5fcc]" 
              variant="primary"
            >
              保存 Webhook
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
