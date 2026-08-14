namespace AssignmentManagement.Models.DTOs
{
    public class CreateClassDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TeacherId { get; set; }
    }

    public class UpdateClassDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TeacherId { get; set; }
    }
}
