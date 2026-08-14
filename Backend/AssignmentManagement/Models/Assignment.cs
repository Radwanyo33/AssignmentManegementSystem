using System.ComponentModel.DataAnnotations;
namespace AssignmentManagement.Models
{
    public class Assignment
    {
        public int Id { get; set; }
        [Required]
        public string? Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }
        public bool IsPublished { get; set; } = false;
        public int ClassId { get; set; }
        public int SubjectId { get; set; }
        public int TeacherId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        //Relationships
        public virtual User? Teacher { get; set; }
        public virtual Class? Class { get; set; }
        public virtual Subject? Subject { get; set; }
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
