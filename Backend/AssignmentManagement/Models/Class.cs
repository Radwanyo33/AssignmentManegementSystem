using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Models
{
    public class Class
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TeacherId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        //Realationship
        public virtual User? Teacher { get; set; }
        public virtual ICollection<Subject>? Subjects { get; set; }
        public virtual ICollection<Assignment>? Assignments { get; set; }
    }
}
