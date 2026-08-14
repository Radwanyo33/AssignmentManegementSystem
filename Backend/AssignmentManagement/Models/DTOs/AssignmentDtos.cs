namespace AssignmentManagement.Models.DTOs
{
    public class AssignmentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }
        public bool IsPublished { get; set; }
        public string? ClassName { get; set; }
        public string SubjectName { get; set; } = null!;
        public string TeacherName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int SubmissionCount { get; set; }
    }

    public class CreateAssignmentDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }
        public bool IsPublished { get; set; } = false;
        public int ClassId { get; set; }
        public int SubjectId { get; set; }
    }

    public class AssignmentDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }
        public bool IsPublished { get; set; }
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<SubmissionDto> Submissions { get; set; } = new();
    }
}
