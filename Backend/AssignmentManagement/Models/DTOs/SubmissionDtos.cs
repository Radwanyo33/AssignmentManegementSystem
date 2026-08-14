namespace AssignmentManagement.Models.DTOs
{
    public class SubmissionDto
    {
        public int Id { get; set; }
        public int AssignmentId { get; set; }
        public string? AssignmentTitle { get; set; }
        public int StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? Answer { get; set; }
        public DateTime SubmittedAt { get; set; }
        public int? Marks { get; set; }
        public string? Feedback { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateSubmissionDto
    {
        public int AssignmentId { get; set; }
        public string? Answer { get; set; }
    }

    public class GradeSubmissionDto
    {
        public int Marks { get; set; }
        public string? Feedback { get; set; }
    }

    public class SubmissionDetailDto
    {
        public int Id { get; set; }
        public int AssignmentId { get; set; }
        public AssignmentDto Assignment { get; set; } = null!;
        public int StudentId { get; set; }
        public UserDto Student { get; set; } = null!;
        public string? Answer { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? Marks { get; set; }
        public string? Feedback { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool CanBeUpdated { get; set; }
    }
}
