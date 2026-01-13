/* eslint-disable prettier/prettier */
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ClubSettings {
  clubName: string;
  description: string;
  email: string;
  location: string;
  meetingTime: string;
  phone: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  discord: string;
}

const defaultSettings: ClubSettings = {
  clubName: '康中电脑学会',
  description: '我们是一群热爱科技的学生，致力于探索编程、人工智能、网络安全等领域。',
  email: 'computerclub@school.edu.my',
  location: '电脑室 A304，科学楼三楼',
  meetingTime: '每周五 下午 4:00 - 6:00',
  phone: '+60 1-XXXX-XXXX',
  website: 'https://computerclub.school.edu.my',
  facebook: 'https://facebook.com/computerclub',
  twitter: 'https://twitter.com/computerclub',
  instagram: 'https://instagram.com/computerclub',
  discord: 'https://discord.gg/computerclub',
};

export default function ClubSettings() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<ClubSettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'advanced'>('basic');

  // 权限检查
  useEffect(() => {
    if (!isLoading && (!user || !('role' in user) || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleInputChange = (field: keyof ClubSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setSettings(defaultSettings);
    setIsEditing(false);
  };

  // 如果正在加载或没有权限，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#102219] text-white">
        <Header />
        <main className="grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ec80] mx-auto mb-4"></div>
            <p className="text-gray-400">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  // 检查权限
  if (!user || !('role' in user) || user.role !== 'admin') {
    return null; // 由 useEffect 重定向处理
  }

  return (
    <div className="min-h-screen bg-[#102219] text-white">
      <Header />

      <main className="grow py-8 px-4 md:px-10 lg:px-20">
        <div className="max-w-300 mx-auto">
          {/* 页面头部 */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black mb-2">社团设置</h1>
            <p className="text-gray-400">管理社团信息和联系方式</p>
          </div>

          {/* 成功提示 */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-green-400">check_circle</span>
              <p className="text-sm">设置已成功保存！</p>
            </div>
          )}

          {/* 主要内容 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧 - 选项卡导航 */}
            <div className="lg:col-span-1">
              <div className="bg-[#1A2C23] rounded-xl border border-white/5 p-4 sticky top-24">
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'basic'
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined">info</span>
                    基本信息
                  </button>
                  <button
                    onClick={() => setActiveTab('social')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'social'
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined">share</span>
                    社交媒体
                  </button>
                  <button
                    onClick={() => setActiveTab('advanced')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'advanced'
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined">settings</span>
                    高级选项
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧 - 内容区域 */}
            <div className="lg:col-span-3">
              <div className="bg-[#1A2C23] rounded-xl border border-white/5 p-6 md:p-8">
                {/* 基本信息选项卡 */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">基本信息</h3>
                        <p className="text-sm text-gray-400 mt-1">编辑社团的基本信息</p>
                      </div>
                      <Button
                        variant={isEditing ? 'secondary' : 'primary'}
                        size="sm"
                        rightIcon={isEditing ? 'close' : 'edit'}
                        onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                      >
                        {isEditing ? '取消' : '编辑'}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* 社团名称 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          社团名称
                        </label>
                        <Input
                          value={settings.clubName}
                          onChange={(e) => handleInputChange('clubName', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="groups"
                        />
                      </div>

                      {/* 描述 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          社团描述
                        </label>
                        <textarea
                          className="w-full rounded-xl border border-white/10 bg-[#102219] p-4 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                          placeholder="输入社团描述..."
                          rows={4}
                          value={settings.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      {/* 邮箱 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          邮箱地址
                        </label>
                        <Input
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="mail"
                        />
                      </div>

                      {/* 电话 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          电话号码
                        </label>
                        <Input
                          type="tel"
                          value={settings.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="phone"
                        />
                      </div>

                      {/* 地点 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          社团地点
                        </label>
                        <Input
                          value={settings.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="location_on"
                        />
                      </div>

                      {/* 活动时间 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          活动时间
                        </label>
                        <Input
                          value={settings.meetingTime}
                          onChange={(e) => handleInputChange('meetingTime', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="schedule"
                        />
                      </div>
                    </div>

                    {/* 保存/取消按钮 */}
                    {isEditing && (
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <Button
                          variant="secondary"
                          onClick={handleCancel}
                          className="flex-1"
                        >
                          取消
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          isLoading={isSaving}
                          rightIcon="check"
                          className="flex-1"
                        >
                          保存更改
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 社交媒体选项卡 */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">社交媒体</h3>
                        <p className="text-sm text-gray-400 mt-1">管理社交媒体链接</p>
                      </div>
                      <Button
                        variant={isEditing ? 'secondary' : 'primary'}
                        size="sm"
                        rightIcon={isEditing ? 'close' : 'edit'}
                        onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                      >
                        {isEditing ? '取消' : '编辑'}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* 网站 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          官方网站
                        </label>
                        <Input
                          type="url"
                          value={settings.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="language"
                          placeholder="https://..."
                        />
                      </div>

                      {/* Facebook */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Facebook
                        </label>
                        <Input
                          type="url"
                          value={settings.facebook}
                          onChange={(e) => handleInputChange('facebook', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="groups"
                          placeholder="https://facebook.com/..."
                        />
                      </div>

                      {/* Twitter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Twitter / X
                        </label>
                        <Input
                          type="url"
                          value={settings.twitter}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="public"
                          placeholder="https://twitter.com/..."
                        />
                      </div>

                      {/* Instagram */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Instagram
                        </label>
                        <Input
                          type="url"
                          value={settings.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="photo_camera"
                          placeholder="https://instagram.com/..."
                        />
                      </div>

                      {/* Discord */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Discord 服务器
                        </label>
                        <Input
                          type="url"
                          value={settings.discord}
                          onChange={(e) => handleInputChange('discord', e.target.value)}
                          disabled={!isEditing}
                          leftIcon="forum"
                          placeholder="https://discord.gg/..."
                        />
                      </div>
                    </div>

                    {/* 保存/取消按钮 */}
                    {isEditing && (
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <Button
                          variant="secondary"
                          onClick={handleCancel}
                          className="flex-1"
                        >
                          取消
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          isLoading={isSaving}
                          rightIcon="check"
                          className="flex-1"
                        >
                          保存更改
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* 高级选项选项卡 */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">高级选项</h3>
                      <p className="text-sm text-gray-400 mb-6">更多社团管理功能</p>
                    </div>

                    <div className="space-y-4">
                      {/* 导入/导出 */}
                      <div className="p-4 bg-[#102219] rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">导入/导出社团数据</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              备份或导出社团的所有信息
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" rightIcon="download">
                              导出
                            </Button>
                            <Button variant="secondary" size="sm" rightIcon="upload">
                              导入
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 通知设置 */}
                      <div className="p-4 bg-[#102219] rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">通知设置</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              配置系统通知的发送方式
                            </p>
                          </div>
                          <Button variant="secondary" size="sm" rightIcon="settings">
                            配置
                          </Button>
                        </div>
                      </div>

                      {/* 成员管理 */}
                      <div className="p-4 bg-[#102219] rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">成员管理</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              管理社团的领导团队和主要成员
                            </p>
                          </div>
                          <Button variant="secondary" size="sm" rightIcon="group">
                            管理
                          </Button>
                        </div>
                      </div>

                      {/* 日志记录 */}
                      <div className="p-4 bg-[#102219] rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">活动日志</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              查看社团的所有重要操作记录
                            </p>
                          </div>
                          <Button variant="secondary" size="sm" rightIcon="history">
                            查看
                          </Button>
                        </div>
                      </div>

                      {/* 危险区域 */}
                      <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-red-400">删除社团</h4>
                            <p className="text-sm text-red-400/70 mt-1">
                              永久删除社团及所有相关数据（无法恢复）
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            rightIcon="delete"
                            className="bg-red-500/20! text-red-400! hover:bg-red-500/30!"
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
