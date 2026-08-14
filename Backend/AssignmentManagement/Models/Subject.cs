using System.ComponentModel.DataAnnotations;
namespace AssignmentManagement.Models
{
    public class Subject
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public int? ClassId { get; set; }
        public int? TeacherId { get; set; }

        //Relationships
        public virtual Class Class { get; set; } = null!;
        public virtual User? Teacher { get; set; }
        public virtual ICollection<Assignment>? Assignments { get; set; }

    }
}
