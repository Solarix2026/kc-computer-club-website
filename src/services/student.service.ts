/* eslint-disable prettier/prettier */
import { databases, account } from './appwrite';
import { ID, Query } from 'appwrite';
import bcrypt from 'bcryptjs';

/**
 * 学生管理服务
 * 批量导入、删除、查询学生信息
 */

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || '';
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION || '';

/**
 * 学生完整信息接口（含出勤、项目）
 */
export interface StudentFullInfo {
  $id: string;
  email: string;
  name: string;
  studentId: string;
  className?: string;
  role: string;
  createdAt: string;
  // 关联数据
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

/**
 * Excel导入的学生数据接口
 */
export interface ImportStudentData {
  name: string;
  email: string;
  studentId: string;
  className?: string;
  password?: string;
}

/**
 * 从邮箱提取学号
 * 格式: 12345@kuencheng.edu.my -> 12345
 */
export function extractStudentIdFromEmail(email: string): string {
  const match = email.match(/^(\d+)@/);
  return match ? match[1] : '';
}

/**
 * 自动识别Excel列名映射
 * 支持多种常见列名格式
 */
export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  const namePatterns = ['姓名', '名字', 'name', 'student name', '学生姓名', '全名'];
  const emailPatterns = ['邮箱', 'email', '电邮', 'e-mail', '邮件地址', 'student email'];
  const studentIdPatterns = ['学号', 'student id', 'id', '编号', 'student number', '学生编号'];
  const classPatterns = ['班级', 'class', '班', '年级班级', 'grade', '年级'];
  
  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase().trim();
    
    if (namePatterns.some(p => lowerHeader.includes(p.toLowerCase()))) {
      mapping['name'] = header;
    } else if (emailPatterns.some(p => lowerHeader.includes(p.toLowerCase()))) {
      mapping['email'] = header;
    } else if (studentIdPatterns.some(p => lowerHeader.includes(p.toLowerCase()))) {
      mapping['studentId'] = header;
    } else if (classPatterns.some(p => lowerHeader.includes(p.toLowerCase()))) {
      mapping['className'] = header;
    }
  });
  
  return mapping;
}

/**
 * 验证学生数据有效性
 */
export function validateStudentData(data: ImportStudentData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('姓名至少需要2个字符');
  }
  
  if (!data.email || !data.email.includes('@')) {
    errors.push('邮箱格式无效');
  }
  
  // 如果没有学号，尝试从邮箱提取
  if (!data.studentId && data.email) {
    data.studentId = extractStudentIdFromEmail(data.email);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * 批量导入学生（创建已验证账户）
 */
export async function bulkImportStudents(
  students: ImportStudentData[],
  defaultPassword: string = 'Kc@12345'
): Promise<{ success: number; failed: number; errors: Array<{ email: string; error: string }> }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };
  
  for (const student of students) {
    try {
      // 验证数据
      const validation = validateStudentData(student);
      if (!validation.valid) {
        results.failed++;
        results.errors.push({ email: student.email || 'unknown', error: validation.errors.join('; ') });
        continue;
      }
      
      // 检查邮箱是否已存在
      const existing = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', student.email)]
      );
      
      if (existing.documents.length > 0) {
        results.failed++;
        results.errors.push({ email: student.email, error: '该邮箱已注册' });
        continue;
      }
      
      // 创建用户记录（直接在数据库中创建，无需Appwrite Account）
      const now = new Date().toISOString();
      const passwordHash = await bcrypt.hash(student.password || defaultPassword, 10);
      
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          email: student.email.toLowerCase().trim(),
          name: student.name.trim(),
          studentId: student.studentId || extractStudentIdFromEmail(student.email),
          className: student.className || '',
          role: 'student',
          passwordHash: passwordHash,
          emailVerified: true, // 批量导入的自动验证
          createdAt: now,
          updatedAt: now,
        }
      );
      
      results.success++;
    } catch (error) {
      results.failed++;
      const err = error as Error;
      results.errors.push({ email: student.email || 'unknown', error: err.message || '未知错误' });
    }
  }
  
  return results;
}

/**
 * 获取所有学生列表
 */
export async function getAllStudents(): Promise<StudentFullInfo[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('role', 'student'), Query.limit(500)]
    );
    
    const students: StudentFullInfo[] = [];
    
    for (const doc of response.documents) {
      // 获取出勤统计
      let attendanceStats = { total: 0, present: 0, late: 0, absent: 0 };
      try {
        // 尝试使用 studentEmail 索引查询
        const attendanceResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          ATTENDANCE_COLLECTION_ID,
          [Query.equal('studentEmail', doc.email), Query.limit(200)]
        );
        attendanceStats.total = attendanceResponse.documents.length;
        attendanceStats.present = attendanceResponse.documents.filter(a => a.status === 'present').length;
        attendanceStats.late = attendanceResponse.documents.filter(a => a.status === 'late').length;
        attendanceStats.absent = attendanceResponse.documents.filter(a => a.status === 'absent').length;
      } catch (e) {
        // 如果索引不存在，尝试使用 studentId 查询（备选方案）
        console.warn('使用 studentEmail 查询失败，尝试使用 studentId:', doc.studentId);
        try {
          const studentIdToFind = doc.studentId || extractStudentIdFromEmail(doc.email);
          if (studentIdToFind) {
            const attendanceResponse = await databases.listDocuments(
              APPWRITE_DATABASE_ID,
              ATTENDANCE_COLLECTION_ID,
              [Query.equal('studentId', studentIdToFind), Query.limit(200)]
            );
            attendanceStats.total = attendanceResponse.documents.length;
            attendanceStats.present = attendanceResponse.documents.filter(a => a.status === 'present').length;
            attendanceStats.late = attendanceResponse.documents.filter(a => a.status === 'late').length;
            attendanceStats.absent = attendanceResponse.documents.filter(a => a.status === 'absent').length;
          }
        } catch (e2) {
          console.warn('获取出勤记录失败:', e2);
        }
      }
      
      // 获取项目信息
      let projects: StudentFullInfo['projects'] = [];
      try {
        const projectResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          PROJECTS_COLLECTION_ID,
          [Query.limit(100)]
        );
        const studentEmail = doc.email.toLowerCase().trim();
        
        // 查找该学生参与的项目
        for (const project of projectResponse.documents) {
          const leaderEmail = (project.leaderEmail || '').toLowerCase().trim();
          
          if (leaderEmail === studentEmail) {
            projects.push({
              projectId: project.$id,
              title: project.title,
              teamName: project.teamName,
              role: '组长',
              status: project.status,
            });
          } else if (project.members) {
            try {
              const members = typeof project.members === 'string' ? JSON.parse(project.members) : project.members;
              const member = members.find((m: { email?: string }) => 
                m.email && m.email.toLowerCase().trim() === studentEmail
              );
              if (member) {
                projects.push({
                  projectId: project.$id,
                  title: project.title,
                  teamName: project.teamName,
                  role: member.role || '成员',
                  status: project.status,
                });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      } catch (e) {
        console.warn('获取项目记录失败:', e);
      }
      
      students.push({
        $id: doc.$id,
        email: doc.email,
        name: doc.name,
        studentId: doc.studentId || extractStudentIdFromEmail(doc.email),
        className: doc.className || '',
        role: doc.role,
        createdAt: doc.createdAt || doc.$createdAt,
        attendanceStats,
        projects,
      });
    }
    
    return students;
  } catch (error) {
    console.error('获取学生列表失败:', error);
    throw error;
  }
}

/**
 * 获取单个学生详细信息
 */
export async function getStudentById(studentId: string): Promise<StudentFullInfo | null> {
  try {
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      studentId
    );
    
    // 获取出勤统计
    let attendanceStats = { total: 0, present: 0, late: 0, absent: 0 };
    try {
      const attendanceResponse = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        [Query.equal('studentEmail', doc.email), Query.limit(200)]
      );
      attendanceStats.total = attendanceResponse.documents.length;
      attendanceStats.present = attendanceResponse.documents.filter(a => a.status === 'present').length;
      attendanceStats.late = attendanceResponse.documents.filter(a => a.status === 'late').length;
      attendanceStats.absent = attendanceResponse.documents.filter(a => a.status === 'absent').length;
    } catch (e) {
      console.warn('获取出勤记录失败:', e);
    }
    
    // 获取项目信息
    let projects: StudentFullInfo['projects'] = [];
    try {
      const projectResponse = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [Query.limit(100)]
      );
      const studentEmail = doc.email.toLowerCase().trim();
      
      for (const project of projectResponse.documents) {
        const leaderEmail = (project.leaderEmail || '').toLowerCase().trim();
        
        if (leaderEmail === studentEmail) {
          projects.push({
            projectId: project.$id,
            title: project.title,
            teamName: project.teamName,
            role: '组长',
            status: project.status,
          });
        } else if (project.members) {
          try {
            const members = typeof project.members === 'string' ? JSON.parse(project.members) : project.members;
            const member = members.find((m: { email?: string }) => 
              m.email && m.email.toLowerCase().trim() === studentEmail
            );
            if (member) {
              projects.push({
                projectId: project.$id,
                title: project.title,
                teamName: project.teamName,
                role: member.role || '成员',
                status: project.status,
              });
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (e) {
      console.warn('获取项目记录失败:', e);
    }
    
    return {
      $id: doc.$id,
      email: doc.email,
      name: doc.name,
      studentId: doc.studentId || extractStudentIdFromEmail(doc.email),
      className: doc.className || '',
      role: doc.role,
      createdAt: doc.createdAt || doc.$createdAt,
      attendanceStats,
      projects,
    };
  } catch (error) {
    console.error('获取学生详情失败:', error);
    return null;
  }
}

/**
 * 删除单个学生
 */
export async function deleteStudent(studentId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      studentId
    );
  } catch (error) {
    console.error('删除学生失败:', error);
    throw error;
  }
}

/**
 * 删除所有学生用户
 */
export async function deleteAllStudents(): Promise<{ deleted: number; failed: number }> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('role', 'student'), Query.limit(500)]
    );
    
    let deleted = 0;
    let failed = 0;
    
    for (const doc of response.documents) {
      try {
        await databases.deleteDocument(
          APPWRITE_DATABASE_ID,
          USERS_COLLECTION_ID,
          doc.$id
        );
        deleted++;
      } catch (e) {
        failed++;
        console.error('删除学生失败:', doc.$id, e);
      }
    }
    
    return { deleted, failed };
  } catch (error) {
    console.error('批量删除学生失败:', error);
    throw error;
  }
}

/**
 * 更新学生信息
 */
export async function updateStudent(
  studentId: string,
  data: { name?: string; className?: string; studentId?: string }
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    
    if (data.name) updateData.name = data.name;
    if (data.className !== undefined) updateData.className = data.className;
    if (data.studentId) updateData.studentId = data.studentId;
    
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      studentId,
      updateData
    );
  } catch (error) {
    console.error('更新学生信息失败:', error);
    throw error;
  }
}
