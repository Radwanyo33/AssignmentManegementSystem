using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AssignmentManagement.Data;
using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace AssignmentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AssignmentsController> _logger;

        public AssignmentsController(ApplicationDbContext context, ILogger<AssignmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAssignments()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IQueryable<Assignment> query = _context.Assignments
                    .Include(a => a.Class)
                    .Include(a => a.Subject)
                    .Include(a => a.Teacher)
                    .Include(a => a.Submissions);

                // Filter based on Role
                if (role == "Student")
                {
                    var studentClasses = await _context.Subjects
                        .Where(s => s.ClassId != null)
                        .Select(s => s.ClassId.Value)
                        .Distinct()
                        .ToListAsync();

                    query = query.Where(a => studentClasses.Contains(a.ClassId));
                }
                else if (role == "Teacher")
                {
                    query = query.Where(a => a.TeacherId == userId);
                }

                var assignments = await query
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new AssignmentDto
                    {
                        Id = a.Id,
                        Title = a.Title ?? string.Empty,
                        Description = a.Description ?? string.Empty,
                        Deadline = a.Deadline,
                        MaxMarks = a.MaxMarks,
                        IsPublished = a.IsPublished,
                        ClassName = a.Class != null ? a.Class.Name : "N/A",
                        SubjectName = a.Subject != null ? a.Subject.Name : "N/A",
                        TeacherName = a.Teacher != null ? a.Teacher.FullName : "N/A",
                        CreatedAt = a.CreatedAt,
                        SubmissionCount = a.Submissions != null ? a.Submissions.Count : 0
                    })
                    .ToListAsync();

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting assignments");
                return StatusCode(500, "An error occurred while fetching assignments");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssignment(int id)
        {
            try
            {
                var assignment = await _context.Assignments
                    .Include(a => a.Class)
                    .Include(a => a.Subject)
                    .Include(a => a.Teacher)
                    .Include(a => a.Submissions)
                        .ThenInclude(s => s.Student)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (assignment == null)
                {
                    return NotFound("Assignment not found!");
                }

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (role == "Teacher" && assignment.TeacherId != userId)
                    return Forbid();

                // ✅ Return DTO
                var assignmentDto = new AssignmentDto
                {
                    Id = assignment.Id,
                    Title = assignment.Title ?? string.Empty,
                    Description = assignment.Description ?? string.Empty,
                    Deadline = assignment.Deadline,
                    MaxMarks = assignment.MaxMarks,
                    IsPublished = assignment.IsPublished,
                    ClassName = assignment.Class?.Name ?? "N/A",
                    SubjectName = assignment.Subject?.Name ?? "N/A",
                    TeacherName = assignment.Teacher?.FullName ?? "N/A",
                    CreatedAt = assignment.CreatedAt,
                    SubmissionCount = assignment.Submissions?.Count ?? 0
                };

                return Ok(assignmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting assignment {Id}", id);
                return StatusCode(500, "An error occurred while fetching the assignment");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> CreateAssignment(CreateAssignmentDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Validate Class and Subject exists
                var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
                var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);

                if (!classExists || !subjectExists)
                    return BadRequest("Invalid Class or Subject!");

                var assignment = new Assignment
                {
                    Title = dto.Title,
                    Description = dto.Description ?? string.Empty,
                    Deadline = dto.Deadline,
                    MaxMarks = dto.MaxMarks,
                    IsPublished = dto.IsPublished,
                    ClassId = dto.ClassId,
                    SubjectId = dto.SubjectId,
                    TeacherId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Assignments.Add(assignment);
                await _context.SaveChangesAsync();

                // ✅ Return DTO, NOT the entity!
                var assignmentDto = new AssignmentDto
                {
                    Id = assignment.Id,
                    Title = assignment.Title,
                    Description = assignment.Description,
                    Deadline = assignment.Deadline,
                    MaxMarks = assignment.MaxMarks,
                    IsPublished = assignment.IsPublished,
                    ClassName = (await _context.Classes.FindAsync(assignment.ClassId))?.Name ?? "N/A",
                    SubjectName = (await _context.Subjects.FindAsync(assignment.SubjectId))?.Name ?? "N/A",
                    TeacherName = (await _context.Users.FindAsync(assignment.TeacherId))?.FullName ?? "N/A",
                    CreatedAt = assignment.CreatedAt,
                    SubmissionCount = 0
                };

                return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, assignmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating assignment");
                return StatusCode(500, "An error occurred while creating the assignment");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateAssignment(int id, CreateAssignmentDto dto)
        {
            try
            {
                var assignment = await _context.Assignments.FindAsync(id);
                if (assignment == null)
                    return NotFound("Assignment not found!");

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                if (assignment.TeacherId != userId && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                {
                    return Forbid();
                }

                assignment.Title = dto.Title;
                assignment.Description = dto.Description ?? string.Empty;
                assignment.Deadline = dto.Deadline;
                assignment.MaxMarks = dto.MaxMarks;
                assignment.IsPublished = dto.IsPublished;
                assignment.UpdatedAt = DateTime.UtcNow;  // ✅ Should be UpdatedAt, not CreatedAt

                await _context.SaveChangesAsync();

                // ✅ Return DTO, NOT the entity!
                var assignmentDto = new AssignmentDto
                {
                    Id = assignment.Id,
                    Title = assignment.Title,
                    Description = assignment.Description,
                    Deadline = assignment.Deadline,
                    MaxMarks = assignment.MaxMarks,
                    IsPublished = assignment.IsPublished,
                    ClassName = (await _context.Classes.FindAsync(assignment.ClassId))?.Name ?? "N/A",
                    SubjectName = (await _context.Subjects.FindAsync(assignment.SubjectId))?.Name ?? "N/A",
                    TeacherName = (await _context.Users.FindAsync(assignment.TeacherId))?.FullName ?? "N/A",
                    CreatedAt = assignment.CreatedAt,
                    SubmissionCount = await _context.Submissions.CountAsync(s => s.AssignmentId == assignment.Id)
                };

                return Ok(assignmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating assignment {Id}", id);
                return StatusCode(500, "An error occurred while updating the assignment");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            try
            {
                var assignment = await _context.Assignments.FindAsync(id);

                if (assignment == null)
                    return NotFound("Assignment not found!");

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (assignment.TeacherId != userId && role != "Admin")
                {
                    return Forbid();
                }

                _context.Assignments.Remove(assignment);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting assignment {Id}", id);
                return StatusCode(500, "An error occurred while deleting the assignment");
            }
        }

        [HttpPost("{id}/publish")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> PublishAssignment(int id)
        {
            try
            {
                var assignment = await _context.Assignments.FindAsync(id);
                if (assignment == null)
                    return NotFound("Assignment not found!");

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (assignment.TeacherId != userId && role != "Admin")
                {
                    return Forbid();
                }

                assignment.IsPublished = true;
                assignment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Assignment has been published successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing assignment {Id}", id);
                return StatusCode(500, "An error occurred while publishing the assignment");
            }
        }
    }
}