/* eslint-disable prettier/prettier */
import { databases } from './appwrite';
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
 * 基于 Excel 表格字段设计
 */
export interface StudentFullInfo {
  $id: string;
  // 基本信息
  studentId: string;           // 学号
  chineseName: string;         // 中文姓名
  englishName: string;         // 英文姓名
  email: string;               // 邮箱（学号@kuencheng.edu.my）
  
  // 班级信息
  classNameCn: string;         // 班级(中文) - 如 "高三纯商C"
  classNameEn: string;         // 班级(英文) - 如 "Sr3ComC"
  classCode: string;           // 班级代号 - 如 "A802"
  
  // 社团分组信息
  groupLevel: string;          // 高级组/初级组 "学点&服务" - 如 "初级组 '1 学点'"
  level: string;               // 级别 "课程&课室" - 如 "Advance '高级'"
  
  // 联系方式
  phone: string;               // 电话号码
  instagram: string;           // Instagram (如有)
  
  // 社团职位
  group: string;               // 分组 - 如 "C1 陈俊霖"
  position: string;            // 职位
  notes: string;               // 备注
  
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
 * 对应 Excel 表格的所有列
 */
export interface ImportStudentData {
  studentId: string;           // 学号
  chineseName: string;         // 中文姓名
  englishName: string;         // 英文姓名
  classNameCn: string;         // 班级(中文)
  classNameEn: string;         // 班级(英文)
  classCode: string;           // 班级代号
  groupLevel: string;          // 高级组/初级组
  level: string;               // 级别
  phone: string;               // 电话号码
  instagram: string;           // Instagram
  group: string;               // 分组
  position: string;            // 职位
  notes: string;               // 备注
  password?: string;           // 密码（可选，默认使用学号）
}

/**
 * 默认学生密码
 */
export const DEFAULT_STUDENT_PASSWORD = '11111111';

/**
 * 从邮箱提取学号
 * 格式: 12345@kuencheng.edu.my -> 12345
 */
export function extractStudentIdFromEmail(email: string): string {
  const match = email.match(/^(\d+)@/);
  return match ? match[1] : '';
}

/**
 * 从学号生成邮箱
 * 格式: 12345 -> 12345@kuencheng.edu.my
 */
export function generateEmailFromStudentId(studentId: string): string {
  return `${studentId}@kuencheng.edu.my`;
}

/**
 * 自动识别Excel列名映射
 * 支持多种常见列名格式
 */
export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  // 列名匹配规则
  const patterns: Record<string, string[]> = {
    studentId: ['学号', 'student id', 'id', '编号'],
    chineseName: ['中文姓名', '中文名', '姓名', 'chinese name', '名字'],
    englishName: ['英文姓名', '英文名', 'english name', 'name'],
    classNameCn: ['班级(中文)', '班级（中文）', '班级中文', 'class cn', '班级'],
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
}

/**
 * 验证学生数据有效性
 */
export function validateStudentData(data: ImportStudentData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 必须有学号
  if (!data.studentId || data.studentId.trim().length < 3) {
    errors.push('学号必填且至少3位');
  }
  
  // 必须有中文姓名
  if (!data.chineseName || data.chineseName.trim().length < 2) {
    errors.push('中文姓名至少需要2个字符');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * 批量导入学生（创建已验证账户）
 */
export async function bulkImportStudents(
  students: ImportStudentData[],
  defaultPassword?: string
): Promise<{ success: number; failed: number; errors: Array<{ studentId: string; error: string }> }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ studentId: string; error: string }>,
  };
  
  for (const student of students) {
    try {
      // 验证数据
      const validation = validateStudentData(student);
      if (!validation.valid) {
        results.failed++;
        results.errors.push({ studentId: student.studentId || 'unknown', error: validation.errors.join('; ') });
        continue;
      }
      
      // 生成邮箱
      const email = generateEmailFromStudentId(student.studentId);
      
      // 检查邮箱是否已存在
      const existing = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', email)]
      );
      
      if (existing.documents.length > 0) {
        results.failed++;
        results.errors.push({ studentId: student.studentId, error: '该学号已注册' });
        continue;
      }
      
      // 创建用户记录
      const now = new Date().toISOString();
      // 默认密码：11111111，首次登录必须修改
      const password = student.password || defaultPassword || DEFAULT_STUDENT_PASSWORD;
      const passwordHash = await bcrypt.hash(password, 10);
      // 如果使用默认密码，标记为需要修改密码
      const requirePasswordChange = (password === DEFAULT_STUDENT_PASSWORD);
      
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          email: email.toLowerCase().trim(),
          name: student.chineseName.trim(), // 主要显示名称用中文
          studentId: student.studentId.trim(),
          chineseName: student.chineseName.trim(),
          englishName: (student.englishName || '').trim(),
          classNameCn: (student.classNameCn || '').trim(),
          classNameEn: (student.classNameEn || '').trim(),
          classCode: (student.classCode || '').trim(),
          groupLevel: (student.groupLevel || '').trim(),
          level: (student.level || '').trim(),
          phone: (student.phone || '').trim(),
          instagram: (student.instagram || '').trim(),
          group: (student.group || '').trim(),
          position: (student.position || '').trim(),
          notes: (student.notes || '').trim(),
          role: 'student',
          passwordHash: passwordHash,
          requirePasswordChange: requirePasswordChange,
          emailVerified: true, // 批量导入的自动验证
          createdAt: now,
          updatedAt: now,
        }
      );
      
      results.success++;
    } catch (error) {
      results.failed++;
      const err = error as Error;
      results.errors.push({ studentId: student.studentId || 'unknown', error: err.message || '未知错误' });
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
        const possibleStudentIds: string[] = [];
        const extractedId = extractStudentIdFromEmail(doc.email);
        if (extractedId) possibleStudentIds.push(extractedId);
        if (doc.studentId && !possibleStudentIds.includes(doc.studentId)) {
          possibleStudentIds.push(doc.studentId);
        }
        if (doc.$id && !possibleStudentIds.includes(doc.$id)) {
          possibleStudentIds.push(doc.$id);
        }
        
        for (const studentIdToFind of possibleStudentIds) {
          try {
            const attendanceResponse = await databases.listDocuments(
              APPWRITE_DATABASE_ID,
              ATTENDANCE_COLLECTION_ID,
              [Query.equal('studentId', studentIdToFind), Query.limit(200)]
            );
            
            if (attendanceResponse.documents.length > 0) {
              attendanceStats.total += attendanceResponse.documents.length;
              attendanceStats.present += attendanceResponse.documents.filter(a => a.status === 'present').length;
              attendanceStats.late += attendanceResponse.documents.filter(a => a.status === 'late').length;
              attendanceStats.absent += attendanceResponse.documents.filter(a => a.status === 'absent').length;
            }
          } catch (queryError) {
            console.warn(`查询 studentId=${studentIdToFind} 失败:`, queryError);
          }
        }
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
      
      students.push({
        $id: doc.$id,
        studentId: doc.studentId || extractStudentIdFromEmail(doc.email),
        chineseName: doc.chineseName || doc.name || '',
        englishName: doc.englishName || '',
        email: doc.email,
        classNameCn: doc.classNameCn || doc.className || '',
        classNameEn: doc.classNameEn || '',
        classCode: doc.classCode || '',
        groupLevel: doc.groupLevel || '',
        level: doc.level || '',
        phone: doc.phone || '',
        instagram: doc.instagram || '',
        group: doc.group || '',
        position: doc.position || '',
        notes: doc.notes || '',
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
      const possibleStudentIds: string[] = [];
      const extractedId = extractStudentIdFromEmail(doc.email);
      if (extractedId) possibleStudentIds.push(extractedId);
      if (doc.studentId && !possibleStudentIds.includes(doc.studentId)) {
        possibleStudentIds.push(doc.studentId);
      }
      if (doc.$id && !possibleStudentIds.includes(doc.$id)) {
        possibleStudentIds.push(doc.$id);
      }
      
      for (const studentIdToFind of possibleStudentIds) {
        try {
          const attendanceResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ATTENDANCE_COLLECTION_ID,
            [Query.equal('studentId', studentIdToFind), Query.limit(200)]
          );
          
          if (attendanceResponse.documents.length > 0) {
            attendanceStats.total += attendanceResponse.documents.length;
            attendanceStats.present += attendanceResponse.documents.filter(a => a.status === 'present').length;
            attendanceStats.late += attendanceResponse.documents.filter(a => a.status === 'late').length;
            attendanceStats.absent += attendanceResponse.documents.filter(a => a.status === 'absent').length;
          }
        } catch (queryError) {
          console.warn(`查询 studentId=${studentIdToFind} 失败:`, queryError);
        }
      }
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
      studentId: doc.studentId || extractStudentIdFromEmail(doc.email),
      chineseName: doc.chineseName || doc.name || '',
      englishName: doc.englishName || '',
      email: doc.email,
      classNameCn: doc.classNameCn || doc.className || '',
      classNameEn: doc.classNameEn || '',
      classCode: doc.classCode || '',
      groupLevel: doc.groupLevel || '',
      level: doc.level || '',
      phone: doc.phone || '',
      instagram: doc.instagram || '',
      group: doc.group || '',
      position: doc.position || '',
      notes: doc.notes || '',
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
  docId: string,
  data: Partial<Omit<StudentFullInfo, '$id' | 'attendanceStats' | 'projects' | 'createdAt'>>
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    
    // 复制所有可更新的字段
    const allowedFields = [
      'studentId', 'chineseName', 'englishName', 'email',
      'classNameCn', 'classNameEn', 'classCode',
      'groupLevel', 'level', 'phone', 'instagram',
      'group', 'position', 'notes', 'role'
    ];
    
    for (const field of allowedFields) {
      if (data[field as keyof typeof data] !== undefined) {
        updateData[field] = data[field as keyof typeof data];
        // 同时更新 name 字段（用于兼容旧代码）
        if (field === 'chineseName') {
          updateData['name'] = data.chineseName;
        }
      }
    }
    
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      docId,
      updateData
    );
  } catch (error) {
    console.error('更新学生信息失败:', error);
    throw error;
  }
}
