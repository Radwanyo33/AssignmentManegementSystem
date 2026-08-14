namespace AssignmentManagement.Models
{
    public class ClassEnrollment
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int ClassId { get; set; }
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Relationships
        public User Student { get; set; } = null!;
        public Class Class { get; set; } = null!;
    }
}
