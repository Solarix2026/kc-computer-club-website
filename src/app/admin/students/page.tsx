/* eslint-disable prettier/prettier */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SecureCache } from '@/lib/cache';
import * as XLSX from 'xlsx';

interface StudentFullInfo {
  $id: string;
  email: string;
  studentId: string;
  chineseName: string;
  englishName: string;
  classNameCn: string;
  classNameEn: string;
  classCode: string;
  groupLevel: string;
  level: string;
  phone: string;
  instagram: string;
  group: string;
  position: string;
  notes: string;
  role: string;
  createdAt: string;
  attendanceStats: {
    total: number;
    present: number;
    late: number;
    absent: number;
  };
  projects: Array<{
    projectId: string;
    title: string;
    teamName: string;
    role: string;
    status: string;
  }>;
}

interface ImportPreview {
  headers: string[];
  rows: string[][];
  mapping: Record<string, string>;
  students: Array<{
    studentId: string;
    chineseName: string;
    englishName: string;
    classNameCn: string;
    classNameEn: string;
    classCode: string;
    groupLevel: string;
    level: string;
    phone: string;
    instagram: string;
    group: string;
    position: string;
    notes: string;
  }>;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentFullInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentFullInfo | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Excel导入相关状态
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: Array<{ email: string; error: string }> } | null>(null);
  const [defaultPassword, setDefaultPassword] = useState('Kc@12345');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 删除确认
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // 缓存配置
  const CACHE_KEY = 'admin_students_list';
  const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

  // 加载学生列表（带缓存）
  const fetchStudents = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      // 先检查缓存（除非强制刷新）
      if (!forceRefresh) {
        const cached = SecureCache.get<StudentFullInfo[]>(CACHE_KEY, { ttl: CACHE_TTL, encrypt: false });
        if (cached && cached.length > 0) {
          setStudents(cached);
          setLoading(false);
          return;
        }
      }

      // 从 API 获取数据
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        // 更新缓存
        SecureCache.set(CACHE_KEY, data.students, { ttl: CACHE_TTL, encrypt: false });
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 处理Excel文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        if (jsonData.length < 2) {
          alert('Excel文件至少需要包含标题行和一行数据');
          return;
        }

        const headers = jsonData[0].map(h => String(h || '').trim());
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell));

        // 自动检测列映射
        const mapping = detectColumnMapping(headers);

        // 解析学生数据
        const parsedStudents = rows.map(row => {
          const getCell = (colName: string) => {
            const headerName = mapping[colName];
            if (!headerName) return '';
            const idx = headers.indexOf(headerName);
            return idx >= 0 ? String(row[idx] || '').trim() : '';
          };

          return {
            studentId: getCell('studentId'),
            chineseName: getCell('chineseName'),
            englishName: getCell('englishName'),
            classNameCn: getCell('classNameCn'),
            classNameEn: getCell('classNameEn'),
            classCode: getCell('classCode'),
            groupLevel: getCell('groupLevel'),
            level: getCell('level'),
            phone: getCell('phone'),
            instagram: getCell('instagram'),
            group: getCell('group'),
            position: getCell('position'),
            notes: getCell('notes'),
          };
        }).filter(s => s.studentId && s.chineseName);

        setImportPreview({
          headers,
          rows,
          mapping,
          students: parsedStudents,
        });
        setShowImportModal(true);
      } catch (error) {
        console.error('解析Excel失败:', error);
        alert('解析Excel文件失败，请检查文件格式');
      }
    };
    reader.readAsArrayBuffer(file);
    
    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 自动检测列映射
  const detectColumnMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};
    
    const patterns: Record<string, string[]> = {
      studentId: ['学号', 'student id', 'id', '编号'],
      chineseName: ['中文姓名', '中文名', '姓名', 'chinese name', '名字'],
      englishName: ['英文姓名', '英文名', 'english name', 'name'],
      classNameCn: ['班级(中文)', '班级（中文）', '班级中文', 'class cn'],
      classNameEn: ['班级(英文)', '班级（英文）', '班级英文', 'class en', 'class'],
      classCode: ['班级代号', 'class code', '代号'],
      groupLevel: ['高级组/初级组', '学点&服务', '学点', '组别', 'group level'],
      level: ['级别', '课程&课室', '课程', 'level'],
      phone: ['电话号码', '电话', 'phone', '手机', '联系电话'],
      instagram: ['instagram', 'ig', 'ins', 'instagram (如有)', 'instagram(如有)'],
      group: ['分组', 'group', '小组'],
      position: ['职位', 'position', '职务', '岗位'],
      notes: ['备注', 'notes', 'remark', '说明'],
    };
    
    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase().trim();
      
      for (const [field, fieldPatterns] of Object.entries(patterns)) {
        if (fieldPatterns.some(p => lowerHeader.includes(p.toLowerCase()) || lowerHeader === p.toLowerCase())) {
          if (!mapping[field]) {
            mapping[field] = header;
          }
          break;
        }
      }
    });
    
    return mapping;
  };

  // 从邮箱提取学号
  const extractStudentIdFromEmail = (email: string): string => {
    const match = email.match(/^(\d+)@/);
    return match ? match[1] : '';
  };

  // 更新列映射
  const updateMapping = (field: string, headerName: string) => {
    if (!importPreview) return;
    
    const newMapping = { ...importPreview.mapping, [field]: headerName };
    
    // 重新解析学生数据
    const parsedStudents = importPreview.rows.map(row => {
      const getCell = (colName: string) => {
        const hName = newMapping[colName];
        if (!hName) return '';
        const idx = importPreview.headers.indexOf(hName);
        return idx >= 0 ? String(row[idx] || '').trim() : '';
      };

      return {
        studentId: getCell('studentId'),
        chineseName: getCell('chineseName'),
        englishName: getCell('englishName'),
        classNameCn: getCell('classNameCn'),
        classNameEn: getCell('classNameEn'),
        classCode: getCell('classCode'),
        groupLevel: getCell('groupLevel'),
        level: getCell('level'),
        phone: getCell('phone'),
        instagram: getCell('instagram'),
        group: getCell('group'),
        position: getCell('position'),
        notes: getCell('notes'),
      };
    }).filter(s => s.studentId && s.chineseName);

    setImportPreview({
      ...importPreview,
      mapping: newMapping,
      students: parsedStudents,
    });
  };

  // 执行批量导入
  const handleImport = async () => {
    if (!importPreview || importPreview.students.length === 0) {
      alert('没有有效的学生数据可导入');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: importPreview.students,
          defaultPassword: defaultPassword,
        }),
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success > 0) {
        // 清除缓存并重新获取
        SecureCache.remove(CACHE_KEY);
        fetchStudents(true);
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败');
    } finally {
      setImporting(false);
    }
  };

  // 删除所有学生
  const handleDeleteAll = async () => {
    if (deleteConfirmText !== '确认删除所有学生') {
      alert('请输入确认文本');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/students', {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        alert(`已删除 ${result.deleted} 名学生`);
        setShowDeleteAllModal(false);
        setDeleteConfirmText('');
        // 清除缓存并重新获取
        SecureCache.remove(CACHE_KEY);
        fetchStudents(true);
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  // 删除单个学生
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('确定要删除这名学生吗？')) return;

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        // 清除缓存并重新获取
        SecureCache.remove(CACHE_KEY);
        fetchStudents(true);
        if (selectedStudent?.$id === studentId) {
          setShowDetailModal(false);
          setSelectedStudent(null);
        }
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 过滤学生
  const filteredStudents = students.filter(s => 
    s.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.includes(searchTerm) ||
    s.classNameCn.includes(searchTerm) ||
    s.classNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.classCode.includes(searchTerm) ||
    s.group.includes(searchTerm) ||
    s.position.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        {/* 页面标题和操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', marginRight: '12px', verticalAlign: 'middle', color: '#137fec' }}>school</span>
              学生名单管理
            </h1>
            <p style={{ color: '#8a9e94', marginTop: '8px' }}>
              管理所有学生账户，查看出勤记录和项目参与情况
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <a
              href="/admin/students/create"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
              创建学生
            </a>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#137fec',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>
              导入Excel
            </button>
            <button
              onClick={() => setShowDeleteAllModal(true)}
              disabled={students.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: '#ff7b72',
                border: '1px solid rgba(255, 123, 114, 0.3)',
                borderRadius: '10px',
                cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                opacity: students.length === 0 ? 0.5 : 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete_sweep</span>
              一键删除所有
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #137fec 0%, #0d5bc4 100%)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'rgba(255,255,255,0.9)' }}>groups</span>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>{students.length}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>学生总数</div>
              </div>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'rgba(255,255,255,0.9)' }}>check_circle</span>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                  {students.reduce((sum, s) => sum + s.attendanceStats.present, 0)}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>出勤次数</div>
              </div>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'rgba(255,255,255,0.9)' }}>folder_open</span>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                  {students.reduce((sum, s) => sum + s.projects.length, 0)}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>项目参与</div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索栏 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6189a5', fontSize: '20px' }}>search</span>
            <input
              type="text"
              placeholder="搜索学生姓名、邮箱、学号或班级..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 44px',
                backgroundColor: '#1a2632',
                border: '1px solid #2a3c4a',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* 学生列表 */}
        <div style={{ backgroundColor: '#1a2632', borderRadius: '16px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6189a5' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', animation: 'spin 1s linear infinite' }}>sync</span>
              <p>加载中...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6189a5' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '12px' }}>person_off</span>
              <p>{searchTerm ? '没有找到匹配的学生' : '暂无学生数据，请导入Excel'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#101922' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>学号</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>中文姓名</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>英文姓名</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>班级</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>分组</th>
                    <th style={{ padding: '16px', textAlign: 'center', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>出勤</th>
                    <th style={{ padding: '16px', textAlign: 'center', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>项目</th>
                    <th style={{ padding: '16px', textAlign: 'center', color: '#8a9e94', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #2a3c4a' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.$id} 
                      style={{ borderBottom: '1px solid #2a3c4a', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#232f3e')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '16px', color: '#137fec', fontWeight: 600, fontFamily: 'monospace' }}>{student.studentId}</td>
                      <td style={{ padding: '16px', color: 'white', fontWeight: 500 }}>{student.chineseName}</td>
                      <td style={{ padding: '16px', color: '#8a9e94', fontSize: '13px' }}>{student.englishName || '-'}</td>
                      <td style={{ padding: '16px', color: '#8a9e94' }}>
                        <div>{student.classNameCn || '-'}</div>
                        {student.classCode && <div style={{ fontSize: '11px', color: '#6189a5' }}>{student.classCode}</div>}
                      </td>
                      <td style={{ padding: '16px', color: '#8a9e94' }}>
                        <div>{student.group || '-'}</div>
                        {student.position && <div style={{ fontSize: '11px', color: '#f59e0b' }}>{student.position}</div>}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ 
                            padding: '2px 6px', 
                            backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                            color: '#10b981', 
                            borderRadius: '4px', 
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>{student.attendanceStats.present}</span>
                          <span style={{ 
                            padding: '2px 6px', 
                            backgroundColor: 'rgba(245, 158, 11, 0.2)', 
                            color: '#f59e0b', 
                            borderRadius: '4px', 
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>{student.attendanceStats.late}</span>
                          <span style={{ 
                            padding: '2px 6px', 
                            backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                            color: '#ef4444', 
                            borderRadius: '4px', 
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>{student.attendanceStats.absent}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '4px 10px', 
                          backgroundColor: student.projects.length > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                          color: student.projects.length > 0 ? '#f59e0b' : '#6b7280',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>folder</span>
                          {student.projects.length}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setShowDetailModal(true); }}
                            style={{
                              padding: '8px',
                              backgroundColor: 'rgba(19, 127, 236, 0.1)',
                              color: '#137fec',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                            title="查看详情"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.$id); }}
                            style={{
                              padding: '8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                            title="删除"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Excel导入预览弹窗 */}
        {showImportModal && importPreview && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#1a2632', borderRadius: '20px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #2a3c4a' }}>
                <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#137fec' }}>upload_file</span>
                  导入预览
                </h2>
              </div>
              
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {importResult ? (
                  // 导入结果
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '64px', color: importResult.success > 0 ? '#10b981' : '#ef4444' }}>
                        {importResult.success > 0 ? 'check_circle' : 'error'}
                      </span>
                      <h3 style={{ color: 'white', marginTop: '12px' }}>导入完成</h3>
                      <p style={{ color: '#8a9e94' }}>
                        成功: {importResult.success} 名 | 失败: {importResult.failed} 名
                      </p>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', padding: '16px' }}>
                        <h4 style={{ color: '#ef4444', margin: '0 0 12px' }}>导入失败的记录：</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {importResult.errors.map((err, idx) => (
                            <div key={idx} style={{ padding: '8px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', color: '#ff7b72', fontSize: '13px' }}>
                              <strong>{err.email}</strong>: {err.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // 预览界面
                  <>
                    {/* 列映射配置 */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: 'white', marginBottom: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }}>tune</span>
                        字段映射（自动识别，可手动调整）
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        {[
                          { key: 'studentId', label: '学号 *' },
                          { key: 'chineseName', label: '中文姓名 *' },
                          { key: 'englishName', label: '英文姓名' },
                          { key: 'classNameCn', label: '班级(中文)' },
                          { key: 'classNameEn', label: '班级(英文)' },
                          { key: 'classCode', label: '班级代号' },
                          { key: 'groupLevel', label: '高级组/初级组' },
                          { key: 'level', label: '级别' },
                          { key: 'phone', label: '电话号码' },
                          { key: 'instagram', label: 'Instagram' },
                          { key: 'group', label: '分组' },
                          { key: 'position', label: '职位' },
                          { key: 'notes', label: '备注' },
                        ].map(({ key, label }) => (
                          <div key={key} style={{ backgroundColor: '#101922', padding: '12px', borderRadius: '10px' }}>
                            <label style={{ display: 'block', color: '#8a9e94', fontSize: '12px', marginBottom: '6px' }}>
                              {label}
                            </label>
                            <select
                              value={importPreview.mapping[key] || ''}
                              onChange={(e) => updateMapping(key, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                backgroundColor: '#1a2632',
                                border: '1px solid #2a3c4a',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '13px',
                              }}
                            >
                              <option value="">未选择</option>
                              {importPreview.headers.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 默认密码 */}
                    <div style={{ marginBottom: '24px', backgroundColor: '#101922', padding: '16px', borderRadius: '10px' }}>
                      <label style={{ display: 'block', color: '#8a9e94', fontSize: '12px', marginBottom: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px', verticalAlign: 'middle' }}>lock</span>
                        默认密码（所有导入学生）
                      </label>
                      <input
                        type="text"
                        value={defaultPassword}
                        onChange={(e) => setDefaultPassword(e.target.value)}
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          padding: '10px',
                          backgroundColor: '#1a2632',
                          border: '1px solid #2a3c4a',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                        }}
                      />
                    </div>

                    {/* 预览数据 */}
                    <div>
                      <h4 style={{ color: 'white', marginBottom: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }}>preview</span>
                        数据预览（共 {importPreview.students.length} 条有效记录）
                      </h4>
                      <div style={{ backgroundColor: '#101922', borderRadius: '10px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#0a1015' }}>
                              <th style={{ padding: '12px', textAlign: 'left', color: '#8a9e94', fontSize: '12px', position: 'sticky', top: 0, backgroundColor: '#0a1015' }}>#</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: '#8a9e94', fontSize: '12px', position: 'sticky', top: 0, backgroundColor: '#0a1015' }}>学号</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: '#8a9e94', fontSize: '12px', position: 'sticky', top: 0, backgroundColor: '#0a1015' }}>中文姓名</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: '#8a9e94', fontSize: '12px', position: 'sticky', top: 0, backgroundColor: '#0a1015' }}>英文姓名</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: '#8a9e94', fontSize: '12px', position: 'sticky', top: 0, backgroundColor: '#0a1015' }}>班级</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: '#8a9e94', fontSize: '12px', position: 'sticky', top: 0, backgroundColor: '#0a1015' }}>分组</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.students.slice(0, 50).map((s, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #2a3c4a' }}>
                                <td style={{ padding: '10px 12px', color: '#6189a5', fontSize: '12px' }}>{idx + 1}</td>
                                <td style={{ padding: '10px 12px', color: '#137fec', fontSize: '13px', fontFamily: 'monospace' }}>{s.studentId}</td>
                                <td style={{ padding: '10px 12px', color: 'white', fontSize: '13px' }}>{s.chineseName}</td>
                                <td style={{ padding: '10px 12px', color: '#8a9e94', fontSize: '13px' }}>{s.englishName || '-'}</td>
                                <td style={{ padding: '10px 12px', color: '#8a9e94', fontSize: '13px' }}>{s.classNameCn || s.classNameEn || '-'}</td>
                                <td style={{ padding: '10px 12px', color: '#8a9e94', fontSize: '13px' }}>{s.group || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {importPreview.students.length > 50 && (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#6189a5', fontSize: '13px' }}>
                            还有 {importPreview.students.length - 50} 条记录未显示...
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ padding: '20px 24px', borderTop: '1px solid #2a3c4a', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => { setShowImportModal(false); setImportPreview(null); setImportResult(null); }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#101922',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {importResult ? '关闭' : '取消'}
                </button>
                {!importResult && (
                  <button
                    onClick={handleImport}
                    disabled={importing || importPreview.students.length === 0 || !importPreview.mapping.studentId || !importPreview.mapping.chineseName}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#137fec',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: importing ? 'wait' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      opacity: (importing || importPreview.students.length === 0) ? 0.6 : 1,
                    }}
                  >
                    {importing ? '导入中...' : `确认导入 ${importPreview.students.length} 名学生`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 删除所有学生确认弹窗 */}
        {showDeleteAllModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#1a2632', borderRadius: '20px', width: '100%', maxWidth: '450px', padding: '28px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#ef4444' }}>warning</span>
                <h3 style={{ color: 'white', marginTop: '12px', marginBottom: '8px' }}>危险操作</h3>
                <p style={{ color: '#8a9e94', fontSize: '14px' }}>
                  此操作将删除所有 <strong style={{ color: '#ef4444' }}>{students.length}</strong> 名学生账户，且无法恢复！
                </p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#8a9e94', fontSize: '13px', marginBottom: '8px' }}>
                  请输入「确认删除所有学生」以继续：
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="确认删除所有学生"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#101922',
                    border: '1px solid #2a3c4a',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setShowDeleteAllModal(false); setDeleteConfirmText(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#101922',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting || deleteConfirmText !== '确认删除所有学生'}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: deleting || deleteConfirmText !== '确认删除所有学生' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    opacity: deleteConfirmText !== '确认删除所有学生' ? 0.5 : 1,
                  }}
                >
                  {deleting ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 学生详情弹窗 */}
        {showDetailModal && selectedStudent && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#1a2632', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #2a3c4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 700 }}>
                  学生详情
                </h2>
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedStudent(null); }}
                  style={{ background: 'none', border: 'none', color: '#8a9e94', cursor: 'pointer', padding: '4px' }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {/* 基本信息 */}
                <div style={{ backgroundColor: '#101922', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#137fec', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'white' }}>person</span>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>{selectedStudent.chineseName}</h3>
                      <p style={{ margin: '4px 0 0', color: '#8a9e94' }}>{selectedStudent.englishName || selectedStudent.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>学号</span>
                      <p style={{ color: '#137fec', fontFamily: 'monospace', fontWeight: 600, margin: '4px 0 0' }}>{selectedStudent.studentId}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>班级(中文)</span>
                      <p style={{ color: 'white', margin: '4px 0 0' }}>{selectedStudent.classNameCn || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>班级(英文)</span>
                      <p style={{ color: 'white', margin: '4px 0 0' }}>{selectedStudent.classNameEn || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>班级代号</span>
                      <p style={{ color: 'white', margin: '4px 0 0' }}>{selectedStudent.classCode || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>分组</span>
                      <p style={{ color: 'white', margin: '4px 0 0' }}>{selectedStudent.group || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>职位</span>
                      <p style={{ color: '#f59e0b', margin: '4px 0 0' }}>{selectedStudent.position || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>高级组/初级组</span>
                      <p style={{ color: 'white', margin: '4px 0 0' }}>{selectedStudent.groupLevel || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>级别</span>
                      <p style={{ color: 'white', margin: '4px 0 0' }}>{selectedStudent.level || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>电话</span>
                      <p style={{ color: 'white', margin: '4px 0 0' }}>{selectedStudent.phone || '未设置'}</p>
                    </div>
                    <div>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>Instagram</span>
                      <p style={{ color: '#e4405f', margin: '4px 0 0' }}>{selectedStudent.instagram || '未设置'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#6189a5', fontSize: '12px' }}>备注</span>
                      <p style={{ color: '#8a9e94', margin: '4px 0 0' }}>{selectedStudent.notes || '无'}</p>
                    </div>
                  </div>
                </div>

                {/* 出勤统计 */}
                <div style={{ backgroundColor: '#101922', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h4 style={{ color: 'white', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#137fec' }}>event_available</span>
                    出勤统计
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#1a2632', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>{selectedStudent.attendanceStats.total}</div>
                      <div style={{ fontSize: '12px', color: '#8a9e94' }}>总计</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{selectedStudent.attendanceStats.present}</div>
                      <div style={{ fontSize: '12px', color: '#10b981' }}>出席</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{selectedStudent.attendanceStats.late}</div>
                      <div style={{ fontSize: '12px', color: '#f59e0b' }}>迟到</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{selectedStudent.attendanceStats.absent}</div>
                      <div style={{ fontSize: '12px', color: '#ef4444' }}>缺席</div>
                    </div>
                  </div>
                </div>

                {/* 项目参与 */}
                <div style={{ backgroundColor: '#101922', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ color: 'white', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>folder</span>
                    项目参与 ({selectedStudent.projects.length})
                  </h4>
                  {selectedStudent.projects.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedStudent.projects.map((project, idx) => (
                        <div key={idx} style={{ padding: '12px', backgroundColor: '#1a2632', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ color: 'white', fontWeight: 500 }}>{project.title}</div>
                              <div style={{ color: '#8a9e94', fontSize: '13px', marginTop: '4px' }}>
                                团队: {project.teamName} | 角色: {project.role}
                              </div>
                            </div>
                            <span style={{ 
                              padding: '4px 10px', 
                              backgroundColor: project.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: project.status === 'approved' ? '#10b981' : '#f59e0b',
                              borderRadius: '12px',
                              fontSize: '12px',
                            }}>
                              {project.status === 'approved' ? '已批准' : project.status === 'pending' ? '待审核' : project.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6189a5', textAlign: 'center', margin: 0 }}>暂无项目参与</p>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #2a3c4a', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => handleDeleteStudent(selectedStudent.$id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  删除学生
                </button>
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedStudent(null); }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#137fec',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}
