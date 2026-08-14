// ==================== AUTH TYPES ====================
export interface User {
    id: number;
    email: string;
    fullName: string;
    role: 'Admin' | 'Teacher' | 'Student';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    fullName: string;
    password: string;
    role: 'Admin' | 'Teacher' | 'Student';
}

export interface AuthResponseDto {
    token: string;
    user: UserDto;
}

export interface UserDto {
    id: number;
    email: string;
    fullName: string;
    role: 'Admin' | 'Teacher' | 'Student';
}

export interface CreateUserDto {
    email: string;
    fullName: string;
    password: string;
    role: 'Admin' | 'Teacher' | 'Student';
}

export interface UpdateUserDto {
    fullName: string;
    role: 'Admin' | 'Teacher' | 'Student';
    password?: string;
    isActive: boolean;
}

// ==================== ASSIGNMENT TYPES ====================

// ✅ DTO from backend (matches exactly - for display)
export interface AssignmentDto {
    id: number;
    title: string;
    description?: string;
    deadline: string;
    maxMarks: number;
    isPublished: boolean;
    className?: string;
    subjectName: string;
    teacherName: string;
    createdAt: string;
    submissionCount: number;
}

// ✅ Extended interface for editing (adds IDs)
export interface Assignment extends AssignmentDto {
    classId: number;
    subjectId: number;
    teacherId: number;
}

// ✅ For creating new assignments
export interface CreateAssignmentDto {
    title: string;
    description: string;
    deadline: string;
    maxMarks: number;
    isPublished: boolean;
    classId: number;
    subjectId: number;
}

// ✅ Alias for consistency (can use either)
export interface AssignmentPayload {
    title: string;
    description: string;
    deadline: string;
    maxMarks: number;
    isPublished: boolean;
    classId: number;
    subjectId: number;
}

// ✅ For backward compatibility
export interface CreateAssignmentRequest {
    title: string;
    description: string;
    deadline: string;
    maxMarks: number;
    isPublished: boolean;
    classId: number;
    subjectId: number;
}

// ✅ Full detail DTO (for assignment with submissions)
export interface AssignmentDetailDto {
    id: number;
    title: string;
    description: string;
    deadline: string;
    maxMarks: number;
    isPublished: boolean;
    classId: number;
    className: string;
    subjectId: number;
    subjectName: string;
    teacherId: number;
    teacherName: string;
    createdAt: string;
    updatedAt?: string;
    submissions?: Submission[];
}

// ==================== SUBMISSION TYPES ====================

export interface Submission {
    id: number;
    assignmentId: number;
    assignmentTitle: string;
    studentId: number;
    studentName: string;
    answer: string;
    submittedAt: string;
    updatedAt?: string;
    marks?: number;
    feedback?: string;
    status: 'Draft' | 'Submitted' | 'Graded' | 'Resubmitted';
}

export interface CreateSubmissionDto {
    assignmentId: number;
    answer: string;
}

export interface GradeSubmissionDto {
    marks: number;
    feedback?: string;
}

export interface SubmissionDetailDto {
    id: number;
    assignmentId: number;
    assignment: AssignmentDto;
    studentId: number;
    student: UserDto;
    answer: string;
    submittedAt: string;
    updatedAt?: string;
    marks?: number;
    feedback?: string;
    status: 'Draft' | 'Submitted' | 'Graded' | 'Resubmitted';
    canBeUpdated: boolean;
}

// ==================== CLASS TYPES ====================

export interface Class {
    id: number;
    name: string;
    description: string;
    teacherId?: number;
}

export interface ClassDto {
    id: number;
    name: string;
    description?: string;
    teacherId?: number;
    teacherName?: string;
    subjectCount: number;
    createdAt: string;
}

export interface CreateClassDto {
    name: string;
    description?: string;
    teacherId?: number;
}

export interface UpdateClassDto {
    name: string;
    description?: string;
    teacherId?: number;
}

// ==================== SUBJECT TYPES ====================

export interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    classId: number;
    teacherId?: number;
    className?: string;
    teacherName?: string;
}

export interface SubjectDto {
    id: number;
    name: string;
    code?: string;
    description?: string;
    classId: number;
    className: string;
    teacherId?: number;
    teacherName?: string;
}

export interface CreateSubjectDto {
    name: string;
    code?: string;
    description?: string;
    classId: number;
    teacherId?: number;
}

export interface UpdateSubjectDto {
    name: string;
    code?: string;
    description?: string;
    classId: number;
    teacherId?: number;
}

// ==================== PAGINATION TYPES ====================

export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AssignmentFilterParams extends PaginationParams {
    classId?: number;
    subjectId?: number;
    isPublished?: boolean;
    search?: string;
}

export interface SubmissionFilterParams extends PaginationParams {
    assignmentId?: number;
    studentId?: number;
    status?: 'Draft' | 'Submitted' | 'Graded' | 'Resubmitted';
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
    data: T;
    message?: string;
    statusCode: number;
    timestamp: string;
}

export interface PaginatedApiResponse<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}