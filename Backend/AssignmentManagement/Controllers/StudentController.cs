using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AssignmentManagement.Data;
using AssignmentManagement.Models.DTOs;

namespace AssignmentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="Student")]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetStudentDashboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var submissions = await _context.Submissions
                .Where(s => s.StudentId == userId)
                .ToListAsync();
            var assignments = await _context.Assignments
                .Where(a => a.IsPublished && a.Deadline > DateTime.UtcNow)
                .ToListAsync();

            var submittedIds = submissions.Select(s => s.AssignmentId).ToHashSet();
            var pendingAssignments = assignments.Where(a => !submittedIds.Contains(a.Id)).Count();

            return Ok(new
            {
                TotalSubmissions = submissions.Count(),
                PendingAssignments = pendingAssignments,
                GradedSubmissions = submissions.Count(s => s.Status == "Graded"),
                AverageMarks = submissions.Where(s=> s.Marks.HasValue).Average(s => s.Marks)?? 0
            });
        }
        [HttpGet("assignments/available")]
        public async Task<IActionResult> GetAvailableAssignments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var submittedIds = await _context.Submissions
                .Where(s => s.StudentId == userId)
                .Select(s => s.AssignmentId)
                .ToListAsync();

            var assignments = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Include(a => a.Teacher)
                .Where(a => a.IsPublished && !submittedIds.Contains(a.Id))
                .Select(a => new AssignmentDto
                {
                    Id = a.Id,
                    Title = a.Title ?? string.Empty,
                    Description = a.Description,
                    Deadline = a.Deadline,
                    MaxMarks = a.MaxMarks,
                    IsPublished = a.IsPublished,
                    ClassName = a.Class.Name,
                    SubjectName = a.Subject.Name,
                    TeacherName = a.Teacher.FullName,
                    CreatedAt = a.CreatedAt,
                    SubmissionCount = a.Submissions.Count
                }).ToListAsync();
            return Ok(assignments);
        }
    }
}
