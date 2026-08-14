using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AssignmentManagement.Data;
using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;

namespace AssignmentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubmissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SubmissionsController> _logger;

        public SubmissionsController(ApplicationDbContext context, ILogger<SubmissionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetSubmissions([FromQuery] int? assignmentId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                // ✅ FIXED: Use ClaimTypes.Role, not NameIdentifier
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                IQueryable<Submission> query = _context.Submissions
                    .Include(s => s.Assignment)
                    .Include(s => s.Student)
                    .Include(s => s.Assignment.Class)
                    .Include(s => s.Assignment.Subject);

                if (role == "Teacher")
                    query = query.Where(s => s.Assignment.TeacherId == userId);

                if (assignmentId.HasValue)
                    query = query.Where(s => s.AssignmentId == assignmentId.Value);

                var submissions = await query
                    .OrderByDescending(s => s.SubmittedAt)
                    .Select(s => new SubmissionDto
                    {
                        Id = s.Id,
                        AssignmentId = s.AssignmentId,
                        AssignmentTitle = s.Assignment.Title,
                        StudentId = s.StudentId,
                        StudentName = s.Student.FullName,
                        Answer = s.Answer,
                        SubmittedAt = s.SubmittedAt,
                        Marks = s.Marks,
                        Feedback = s.Feedback,
                        Status = s.Status
                    }).ToListAsync();

                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting submissions");
                return StatusCode(500, "An error occurred while fetching submissions");
            }
        }

        [HttpGet("my-submissions")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMySubmissions()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var submissions = await _context.Submissions
                    .Include(s => s.Assignment)
                    .Include(s => s.Assignment.Class)
                    .Include(s => s.Assignment.Subject)
                    .Where(s => s.StudentId == userId)
                    .OrderByDescending(s => s.SubmittedAt)
                    .Select(s => new SubmissionDto
                    {
                        Id = s.Id,
                        AssignmentId = s.AssignmentId,
                        AssignmentTitle = s.Assignment.Title,
                        StudentId = s.StudentId,
                        StudentName = s.Student.FullName,
                        Answer = s.Answer,
                        SubmittedAt = s.SubmittedAt,
                        Marks = s.Marks,
                        Feedback = s.Feedback,
                        Status = s.Status
                    }).ToListAsync();

                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting my submissions");
                return StatusCode(500, "An error occurred while fetching your submissions");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubmission(int id)
        {
            try
            {
                var submission = await _context.Submissions
                    .Include(s => s.Assignment)
                    .Include(s => s.Student)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (submission == null)
                    return NotFound("Submission not found...");

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (role == "Student" && submission.StudentId != userId)
                    return Forbid();
                if (role == "Teacher" && submission.Assignment.TeacherId != userId)
                    return Forbid();

                // ✅ Return DTO
                var submissionDto = new SubmissionDto
                {
                    Id = submission.Id,
                    AssignmentId = submission.AssignmentId,
                    AssignmentTitle = submission.Assignment.Title,
                    StudentId = submission.StudentId,
                    StudentName = submission.Student.FullName,
                    Answer = submission.Answer,
                    SubmittedAt = submission.SubmittedAt,
                    Marks = submission.Marks,
                    Feedback = submission.Feedback,
                    Status = submission.Status
                };

                return Ok(submissionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting submission {Id}", id);
                return StatusCode(500, "An error occurred while fetching the submission");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateSubmission(CreateSubmissionDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Check if assignment exists and is published
                var assignment = await _context.Assignments
                    .FirstOrDefaultAsync(a => a.Id == dto.AssignmentId);

                if (assignment == null)
                {
                    return NotFound("Assignment not found...");
                }

                if (!assignment.IsPublished)
                {
                    return BadRequest("Assignment is not published yet...");
                }

                if (DateTime.UtcNow > assignment.Deadline)
                {
                    return BadRequest("Assignment Submission Deadline has passed...");
                }

                // Check if student is in the class
                var studentInClass = await _context.Subjects
                    .AnyAsync(s => s.ClassId == assignment.ClassId &&
                                   s.TeacherId != null &&
                                   _context.Users.Any(u => u.Id == userId && u.Role == "Student"));

                if (!studentInClass)
                    return BadRequest("You are not enrolled in the class.");

                // Check if student already submitted the assignment
                var existingSubmission = await _context.Submissions
                    .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == userId);

                if (existingSubmission != null && existingSubmission.Status != "Graded")
                {
                    // Update the submission for resubmission purpose
                    existingSubmission.Answer = dto.Answer;
                    existingSubmission.UpdatedAt = DateTime.UtcNow;
                    existingSubmission.Status = "Resubmitted";
                    await _context.SaveChangesAsync();

                    // ✅ Return DTO
                    var updatedDto = new SubmissionDto
                    {
                        Id = existingSubmission.Id,
                        AssignmentId = existingSubmission.AssignmentId,
                        AssignmentTitle = assignment.Title,
                        StudentId = existingSubmission.StudentId,
                        StudentName = (await _context.Users.FindAsync(userId))?.FullName ?? "Unknown",
                        Answer = existingSubmission.Answer,
                        SubmittedAt = existingSubmission.SubmittedAt,
                        Marks = existingSubmission.Marks,
                        Feedback = existingSubmission.Feedback,
                        Status = existingSubmission.Status
                    };

                    return Ok(updatedDto);
                }

                if (existingSubmission != null && existingSubmission.Status == "Graded")
                {
                    return BadRequest("Assignment has already been Graded! Cannot resubmit...");
                }

                var submission = new Submission
                {
                    AssignmentId = dto.AssignmentId,
                    StudentId = userId,
                    Answer = dto.Answer,
                    SubmittedAt = DateTime.UtcNow,
                    Status = "Submitted"
                };

                _context.Submissions.Add(submission);
                await _context.SaveChangesAsync();

                // ✅ Return DTO
                var newSubmissionDto = new SubmissionDto
                {
                    Id = submission.Id,
                    AssignmentId = submission.AssignmentId,
                    AssignmentTitle = assignment.Title,
                    StudentId = submission.StudentId,
                    StudentName = (await _context.Users.FindAsync(userId))?.FullName ?? "Unknown",
                    Answer = submission.Answer,
                    SubmittedAt = submission.SubmittedAt,
                    Marks = submission.Marks,
                    Feedback = submission.Feedback,
                    Status = submission.Status
                };

                return CreatedAtAction(nameof(GetSubmission), new { id = submission.Id }, newSubmissionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating submission");
                return StatusCode(500, "An error occurred while submitting your answer");
            }
        }

        [HttpPut("{id}/grade")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GradeSubmission(int id, GradeSubmissionDto dto)
        {
            try
            {
                var submission = await _context.Submissions
                    .Include(s => s.Assignment)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (submission == null)
                {
                    return NotFound($"No Submission found against id- {id}...");
                }

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (role == "Teacher" && submission.Assignment.TeacherId != userId)
                {
                    _logger.LogWarning("Teacher {UserId} tried to grade submission {SubmissionId} they don't own", userId, id);
                    return Forbid("You are not the teacher for this assignment");
                }

                if (dto.Marks > submission.Assignment.MaxMarks)
                {
                    return BadRequest($"Marks cannot exceed maximum marks ({submission.Assignment.MaxMarks})");
                }

                if (dto.Marks < 0)
                {
                    return BadRequest("Marks cannot be negative");
                }

                submission.Marks = dto.Marks;
                submission.Feedback = dto.Feedback;
                submission.Status = "Graded";
                submission.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // ✅ Return DTO
                var response = new SubmissionDto
                {
                    Id = submission.Id,
                    AssignmentId = submission.AssignmentId,
                    AssignmentTitle = submission.Assignment.Title,
                    StudentId = submission.StudentId,
                    StudentName = (await _context.Users.FindAsync(submission.StudentId))?.FullName ?? "Unknown",
                    Answer = submission.Answer,
                    SubmittedAt = submission.SubmittedAt,
                    Marks = submission.Marks,
                    Feedback = submission.Feedback,
                    Status = submission.Status
                };

                _logger.LogInformation("Submission {SubmissionId} graded by {UserId} with marks {Marks}", id, userId, dto.Marks);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error grading submission {Id}", id);
                return StatusCode(500, "An error occurred while grading the submission");
            }
        }

        // ✅ FIXED: Changed from "${id}" to "{id}"
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> DeleteSubmission(int id)
        {
            try
            {
                var submission = await _context.Submissions
                    .Include(s => s.Assignment)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (submission == null)
                    return NotFound("Submission not found");

                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (role == "Teacher")
                {
                    var assignment = await _context.Assignments
                        .FirstOrDefaultAsync(a => a.Id == submission.AssignmentId);
                    if (assignment == null || assignment.TeacherId != userId)
                        return Forbid();
                }

                _context.Submissions.Remove(submission);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting submission {Id}", id);
                return StatusCode(500, "An error occurred while deleting the submission");
            }
        }
    }
}