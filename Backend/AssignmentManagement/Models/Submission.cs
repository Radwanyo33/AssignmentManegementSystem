using System.ComponentModel.DataAnnotations;
namespace AssignmentManagement.Models
{
    public class Submission
    {
        public int Id { get; set; }
        public int AssignmentId { get; set; }
        public int StudentId { get; set; }
        public string? Answer { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public int? Marks { get; set; }
        public string? Feedback { get; set; }
        public string Status { get; set; } = "Submitted"; //Draft, Submitted, Graded, Resubmitted

        //Relationships 
        public virtual Assignment Assignment { get; set; } = null!;
        public virtual User Student { get; set; } = null!;
    }
}
