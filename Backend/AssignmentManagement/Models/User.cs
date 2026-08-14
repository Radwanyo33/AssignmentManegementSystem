using System.ComponentModel.DataAnnotations;
using System.Globalization;
namespace AssignmentManagement.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string FullName { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        [Required]
        public string Role { get; set; } = "Student"; // Default role is Student, It can be teacher or admin as well
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        //Relationships
        public virtual ICollection<Assignment>? AssignmentsCreated { get; set; }
        public virtual ICollection<Class>? ClassesTaught { get; set; }
        public virtual ICollection<Submission>? Submissions { get; set; }
    }
}
