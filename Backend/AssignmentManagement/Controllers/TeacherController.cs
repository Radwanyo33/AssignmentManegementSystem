using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Data;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace AssignmentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="Teacher")]
    public class TeacherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public TeacherController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetTeacherDashboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var assignments = await _context.Assignments
                .Where(a => a.TeacherId == userId)
                .Include(a => a.Submissions)
                .ToListAsync();

            var totalSubmissions = assignments.Sum(a => a.Submissions.Count);
            var gradedSubmissions = assignments.Sum(a => a.Submissions?.Count(s => s.Status == "Graded"));

            return Ok(new
            {
                TotalAssignments = assignments.Count,
                PublishedAssignments = assignments.Count(a => a.IsPublished),
                TotalSubmissions = totalSubmissions,
                PendingGrading = totalSubmissions - gradedSubmissions
            });
        }
        [HttpGet("assignments/pending")]
        public async Task<IActionResult> GetPendingGrading()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .Where(s => s.Assignment.TeacherId == userId && s.Status != "Graded")
                .Select(s => new SubmissionDto
                {
                    Id = s.Id,
                    AssignmentId = s.AssignmentId,
                    AssignmentTitle = s.Assignment.Title,
                    StudentId = s.StudentId,
                    StudentName = s.Student.FullName,
                    Answer = s.Answer,
                    SubmittedAt = s.SubmittedAt,
                    Status = s.Status
                })
                .OrderBy(s=> s.SubmittedAt)
                .ToListAsync();
            return Ok(submissions);
        }

        [HttpGet("classes")]
        public async Task<IActionResult> GetTeacherClasses()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var classes = await _context.Classes
                .Where(c => c.TeacherId == userId)
                .Include(c => c.Subjects)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    SubjectCount = c.Subjects != null ? c.Subjects.Count : 0,
                    Subjects = c.Subjects != null ? c.Subjects.Select(s => new
                    {
                        s.Id,
                        s.Name,
                        s.Code
                    }) : null
                }).ToListAsync();

            return Ok(classes);
        }
    }
}
