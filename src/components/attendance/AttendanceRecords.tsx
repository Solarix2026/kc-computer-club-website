/* eslint-disable prettier/prettier */
'use client';

import React, { useState, useEffect } from 'react';
import styles from './AttendanceRecords.module.css';

interface AttendanceRecord {
  $id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkInTime: string;
  sessionTime: '3:15pm' | '4:30pm';
  weekNumber: number;
  status: 'present' | 'absent' | 'late';
}

// 学生统计信息
interface StudentStats {
  studentId: string;
  studentName: string;
  studentEmail: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  records: AttendanceRecord[];
}

// 从邮箱提取学号（前5-6个字符）
const extractStudentId = (email: string): string => {
  const match = email.match(/^([0-9a-zA-Z]{5,6})/i);
  return match ? match[1].toUpperCase() : email.split('@')[0].slice(0, 6);
};

interface AttendanceSummary {
  weekNumber: number;
  session1: {
    total: number;
    students: AttendanceRecord[];
  };
  session2: {
    total: number;
    students: AttendanceRecord[];
  };
}

export default function AttendanceRecords() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weekNumber, setWeekNumber] = useState<number>(0);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // 学生详情模态框
  const [selectedStudent, setSelectedStudent] = useState<StudentStats | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  
  // 验证码相关状态
  const [attendanceCode, setAttendanceCode] = useState<string | null>(null);
  const [codeEnabled, setCodeEnabled] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // 获取学生统计数据
  const fetchStudentStats = async (studentEmail: string, studentName: string) => {
    setIsLoadingStudent(true);
    try {
      // 获取该学生的所有出席记录
      const response = await fetch(`/api/attendance/student-stats?email=${encodeURIComponent(studentEmail)}`);
      const data = await response.json();
      
      if (response.ok) {
        const records = data.records as AttendanceRecord[];
        
        // 统计出席、迟到、缺席次数
        let present = 0, late = 0, absent = 0;
        records.forEach((record) => {
          if (record.status === 'present') present++;
          else if (record.status === 'late') late++;
          else if (record.status === 'absent') absent++;
        });

        setSelectedStudent({
          studentId: extractStudentId(studentEmail),
          studentName,
          studentEmail,
          present,
          late,
          absent,
          total: records.length,
          records,
        });
      } else {
        alert('获取学生记录失败：' + (data.error || '未知错误'));
      }
    } catch (err) {
      const error = err as Error & { message?: string };
      alert('获取学生记录失败：' + (error.message || '未知错误'));
    } finally {
      setIsLoadingStudent(false);
    }
  };

  const handleStudentClick = (email: string, name: string) => {
    fetchStudentStats(email, name);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  const fetchRecords = async (week: number) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/attendance/records?weekNumber=${week}`);
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
      } else {
        setError(data.error || '获取记录失败');
      }
    } catch (err) {
      const error = err as Error & { message?: string };
      setError('获取记录失败：' + (error.message || '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 获取当前周数和验证码状态
    const response = fetch('/api/attendance?action=debug-status');
    response.then((res) => res.json()).then((data) => {
      setWeekNumber(data.config?.weekNumber || 1);
      setAttendanceCode(data.attendanceCode || null);
      setCodeEnabled(data.codeEnabled || false);
      // 重新获取周数
      fetch('/api/attendance').then((res) => res.json()).then((statusData) => {
        setWeekNumber(statusData.weekNumber || 1);
        fetchRecords(statusData.weekNumber || 1);
      });
    });
  }, []);

  // 生成新验证码
  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-code' }),
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceCode(data.attendanceCode);
        setCodeEnabled(true);
      } else {
        alert('生成验证码失败');
      }
    } catch (err) {
      alert('生成验证码失败');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // 清除验证码
  const handleClearCode = async () => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-code' }),
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceCode(null);
        setCodeEnabled(false);
      }
    } catch (err) {
      alert('清除验证码失败');
    }
  };

  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleDateString('zh-CN');
  };

  const handleChangeStatus = async (recordId: string, newStatus: 'present' | 'absent' | 'late') => {
    setUpdatingId(recordId);
    
    try {
      const response = await fetch('/api/attendance/record', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          status: newStatus,
          notes: newStatus === 'late' ? 'Admin 标记为迟到' : undefined,
        }),
      });

      if (response.ok) {
        // 刷新数据
        fetchRecords(weekNumber);
      } else {
        const data = await response.json();
        alert('修改失败：' + (data.error || '未知错误'));
      }
    } catch (err) {
      const error = err as Error & { message?: string };
      alert('修改失败：' + (error.message || '未知错误'));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#3fb950'; // GitHub 绿色
      case 'late':
        return '#d29922'; // GitHub 橙色
      case 'absent':
        return '#ff7b72'; // GitHub 红色
      default:
        return '#6e7681';
    }
  };

  // CSV 导出函数
  const exportToCSV = (sessionNumber: 1 | 2) => {
    if (!summary) return;

    const data = sessionNumber === 1 ? summary.session1.students : summary.session2.students;
    const sessionTime = sessionNumber === 1 ? '下午 3:15-3:30' : '下午 4:30-4:45';

    // 创建 CSV 内容
    const headers = ['学号', '姓名', '邮箱', '签到时间', '签到日期', '状态'];
    const rows = data.map((record) => [
      extractStudentId(record.studentEmail),
      record.studentName,
      record.studentEmail,
      formatTime(record.checkInTime),
      formatDate(record.checkInTime),
      record.status === 'present' ? '出席' : record.status === 'late' ? '迟到' : '缺席',
    ]);

    // 组合 CSV
    const csvContent = [
      [`电脑学会点名记录 - 第${summary.weekNumber}周 - ${sessionTime}`],
      [],
      [headers.join(',')],
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // 添加 UTF-8 BOM 让 Excel 正确识别中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_week${summary.weekNumber}_session${sessionNumber}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!summary) {
    return <div className={styles.empty}>暂无数据</div>;
  }

  return (
    <div className={styles.container}>
      {/* 验证码控制面板 */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2632 0%, #1e3a5f 100%)',
        border: '1px solid rgba(19, 127, 236, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span className="material-symbols-outlined" style={{fontSize: '28px', color: '#137fec'}}>pin</span>
            <div>
              <h3 style={{margin: 0, color: 'white', fontSize: '16px', fontWeight: 600}}>点名验证码</h3>
              <p style={{margin: '4px 0 0', color: '#8a9e94', fontSize: '13px'}}>
                {codeEnabled ? '学生需要输入验证码才能点名' : '验证码功能已关闭'}
              </p>
            </div>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            {codeEnabled && attendanceCode && (
              <div style={{
                background: 'rgba(19, 127, 236, 0.15)',
                border: '2px solid rgba(19, 127, 236, 0.5)',
                borderRadius: '12px',
                padding: '12px 24px',
                textAlign: 'center',
              }}>
                <div style={{color: '#8a9e94', fontSize: '11px', marginBottom: '4px'}}>当前验证码</div>
                <div style={{color: '#137fec', fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '8px'}}>
                  {attendanceCode}
                </div>
              </div>
            )}
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <button
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  background: '#137fec',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isGeneratingCode ? 'wait' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: isGeneratingCode ? 0.7 : 1,
                }}
              >
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>refresh</span>
                {attendanceCode ? '刷新验证码' : '生成验证码'}
              </button>
              
              {codeEnabled && (
                <button
                  onClick={handleClearCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    background: 'transparent',
                    color: '#ff7b72',
                    border: '1px solid rgba(255, 123, 114, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <span className="material-symbols-outlined" style={{fontSize: '18px'}}>close</span>
                  关闭验证码
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.header}>
        <h2><span className="material-symbols-outlined" style={{fontSize: '28px', marginRight: '8px', verticalAlign: 'middle', color: '#137fec'}}>bar_chart</span>点名记录</h2>
        <div className={styles.weekSelector}>
          <button
            onClick={() => {
              const newWeek = Math.max(1, weekNumber - 1);
              setWeekNumber(newWeek);
              fetchRecords(newWeek);
            }}
            className={styles.prevButton}
          >
            <span className="material-symbols-outlined" style={{fontSize: '18px', marginRight: '4px'}}>arrow_back</span>
            上一周
          </button>
          <span className={styles.weekNumber}>第 {summary.weekNumber} 周</span>
          <button 
            onClick={() => {
              const newWeek = weekNumber + 1;
              setWeekNumber(newWeek);
              fetchRecords(newWeek);
            }}
            className={styles.nextButton}
          >
            下一周
            <span className="material-symbols-outlined" style={{fontSize: '18px', marginLeft: '4px'}}>arrow_forward</span>
          </button>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.title}>下午 3:15-3:30</div>
          <div className={styles.count}>{summary.session1.total}</div>
          <div className={styles.label}>人出席</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.title}>下午 4:30-4:45</div>
          <div className={styles.count}>{summary.session2.total}</div>
          <div className={styles.label}>人出席</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.title}>本周总人次</div>
          <div className={styles.count}>{summary.session1.total + summary.session2.total}</div>
          <div className={styles.label}>次出席</div>
        </div>
      </div>

      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3><span className="material-symbols-outlined" style={{fontSize: '20px', marginRight: '8px', verticalAlign: 'middle', color: '#137fec'}}>location_on</span>下午 3:15-3:30 点名记录</h3>
          <button
            onClick={() => exportToCSV(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#137fec',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0d5bc4';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#137fec';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            导出 CSV
          </button>
        </div>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.col1}>学号</div>
            <div className={styles.col2}>学生姓名</div>
            <div className={styles.col3}>邮箱</div>
            <div className={styles.col4}>点名时间</div>
            <div className={styles.col5}>状态</div>
          </div>
          <div className={styles.tableBody}>
            {summary.session1.students.length > 0 ? (
              summary.session1.students.map((record) => (
                <div key={record.$id} className={styles.tableRow}>
                  <div 
                    className={styles.col1} 
                    style={{ fontWeight: '600', color: '#137fec', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => handleStudentClick(record.studentEmail, record.studentName)}
                    title="点击查看学生出席统计"
                  >
                    {extractStudentId(record.studentEmail)}
                  </div>
                  <div className={styles.col2}>{record.studentName}</div>
                  <div className={styles.col3}>{record.studentEmail}</div>
                  <div className={styles.col4}>
                    {formatDate(record.checkInTime)} {formatTime(record.checkInTime)}
                  </div>
                  <div className={styles.col5}>
                    {updatingId === record.$id ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite', color: '#6e7681' }}>
                        sync
                      </span>
                    ) : (
                      <div className={styles.statusButtonGroup}>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'present')}
                          className={`${styles.statusBtn} ${styles.statusBtnPresent} ${record.status === 'present' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="出席"
                        >
                          出席
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'late')}
                          className={`${styles.statusBtn} ${styles.statusBtnLate} ${record.status === 'late' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="迟到"
                        >
                          迟到
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'absent')}
                          className={`${styles.statusBtn} ${styles.statusBtnAbsent} ${record.status === 'absent' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="缺席"
                        >
                          缺席
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>暂无点名记录</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3><span className="material-symbols-outlined" style={{fontSize: '20px', marginRight: '8px', verticalAlign: 'middle', color: '#137fec'}}>location_on</span>下午 4:30-4:45 点名记录</h3>
          <button
            onClick={() => exportToCSV(2)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#137fec',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0d5bc4';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#137fec';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            导出 CSV
          </button>
        </div>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.col1}>学号</div>
            <div className={styles.col2}>学生姓名</div>
            <div className={styles.col3}>邮箱</div>
            <div className={styles.col4}>点名时间</div>
            <div className={styles.col5}>状态</div>
          </div>
          <div className={styles.tableBody}>
            {summary.session2.students.length > 0 ? (
              summary.session2.students.map((record) => (
                <div key={record.$id} className={styles.tableRow}>
                  <div 
                    className={styles.col1} 
                    style={{ fontWeight: '600', color: '#137fec', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => handleStudentClick(record.studentEmail, record.studentName)}
                    title="点击查看学生出席统计"
                  >
                    {extractStudentId(record.studentEmail)}
                  </div>
                  <div className={styles.col2}>{record.studentName}</div>
                  <div className={styles.col3}>{record.studentEmail}</div>
                  <div className={styles.col4}>
                    {formatDate(record.checkInTime)} {formatTime(record.checkInTime)}
                  </div>
                  <div className={styles.col5}>
                    {updatingId === record.$id ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite', color: '#6e7681' }}>
                        sync
                      </span>
                    ) : (
                      <div className={styles.statusButtonGroup}>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'present')}
                          className={`${styles.statusBtn} ${styles.statusBtnPresent} ${record.status === 'present' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="出席"
                        >
                          出席
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'late')}
                          className={`${styles.statusBtn} ${styles.statusBtnLate} ${record.status === 'late' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="迟到"
                        >
                          迟到
                        </button>
                        <button
                          onClick={() => handleChangeStatus(record.$id, 'absent')}
                          className={`${styles.statusBtn} ${styles.statusBtnAbsent} ${record.status === 'absent' ? styles.active : ''}`}
                          disabled={updatingId === record.$id}
                          title="缺席"
                        >
                          缺席
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>暂无点名记录</div>
            )}
          </div>
        </div>
      </div>

      {/* 学生统计模态框 */}
      {(selectedStudent || isLoadingStudent) && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {isLoadingStudent ? (
              <div className={styles.modalLoading}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', animation: 'spin 1s linear infinite', color: '#137fec' }}>
                  sync
                </span>
                <p>加载中...</p>
              </div>
            ) : selectedStudent && (
              <>
                <div className={styles.modalHeader}>
                  <h2>
                    <span className="material-symbols-outlined" style={{ marginRight: '8px', color: '#137fec' }}>person</span>
                    学生出席统计
                  </h2>
                  <button className={styles.closeBtn} onClick={closeModal}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className={styles.studentInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>学号:</span>
                    <span className={styles.value}>{selectedStudent.studentId}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>姓名:</span>
                    <span className={styles.value}>{selectedStudent.studentName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>邮箱:</span>
                    <span className={styles.value}>{selectedStudent.studentEmail}</span>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard} style={{ borderColor: '#3fb950' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#3fb950' }}>check_circle</span>
                    <div className={styles.statNumber} style={{ color: '#3fb950' }}>{selectedStudent.present}</div>
                    <div className={styles.statLabel}>出席</div>
                  </div>
                  <div className={styles.statCard} style={{ borderColor: '#d29922' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#d29922' }}>schedule</span>
                    <div className={styles.statNumber} style={{ color: '#d29922' }}>{selectedStudent.late}</div>
                    <div className={styles.statLabel}>迟到</div>
                  </div>
                  <div className={styles.statCard} style={{ borderColor: '#ff7b72' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#ff7b72' }}>cancel</span>
                    <div className={styles.statNumber} style={{ color: '#ff7b72' }}>{selectedStudent.absent}</div>
                    <div className={styles.statLabel}>缺席</div>
                  </div>
                </div>

                <div className={styles.attendanceRate}>
                  <span className={styles.label}>出席率:</span>
                  <span className={styles.rateValue}>
                    {selectedStudent.total > 0 
                      ? Math.round((selectedStudent.present / selectedStudent.total) * 100) 
                      : 0}%
                  </span>
                  <span className={styles.rateTotal}>（共 {selectedStudent.total} 次点名）</span>
                </div>

                {selectedStudent.records.length > 0 && (
                  <div className={styles.recordsHistory}>
                    <h3>
                      <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>history</span>
                      最近出席记录
                    </h3>
                    <div className={styles.historyList}>
                      {selectedStudent.records.slice(0, 10).map((record) => (
                        <div key={record.$id} className={styles.historyItem}>
                          <span className={styles.historyDate}>
                            第 {record.weekNumber} 周 · {record.sessionTime === '3:15pm' ? '3:15PM' : '4:30PM'}
                          </span>
                          <span 
                            className={styles.historyStatus}
                            style={{ color: getStatusColor(record.status) }}
                          >
                            {record.status === 'present' ? '出席' : record.status === 'late' ? '迟到' : '缺席'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
