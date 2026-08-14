using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Data;
using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;

namespace AssignmentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Getubjects([FromQuery] int? classId)
        {
            var query = _context.Subjects
                .Include(s => s.Class)
                .Include(s => s.Teacher)
                .AsQueryable();

            if (classId.HasValue)
            {
                query = query.Where(s => s.ClassId == classId.Value);
            }

            var subjects = await query
                .Select(s => new SubjectDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Code = s.Code,
                    Description = s.Description,
                    ClassId = s.ClassId.Value,
                    ClassName = s.Class.Name,
                    TeacherId = s.TeacherId,
                    TeacherName = s.Teacher != null ? s.Teacher.FullName : null
                }).ToListAsync();

            return Ok(subjects);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSuject(int id)
        {
            var subject = await _context.Subjects
                .Include(s => s.Class)
                .Include(s => s.Teacher)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
                return NotFound($"Subject with id {id} not found");

            var subjectDto = new SubjectDto
            {
                Id = subject.Id,
                Name = subject.Name,
                Code = subject.Code,
                Description = subject.Description,
                ClassId = subject.ClassId.Value,
                ClassName = subject.Class.Name,
                TeacherId = subject.TeacherId,
                TeacherName = subject.Teacher != null ? subject.Teacher.FullName : null
            };

            return Ok(subjectDto);
        }

        [HttpPost]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> CreateSubject(CreateSubjectDto dto)
        {
            // Check if class exists
            var classExists = _context.Classes.AnyAsync(c => c.Id == dto.ClassId);

            if (classExists == null)
            {
                return NotFound("Class not found...");
            }

            //Check if teacher exists (already provided)
            if (dto.TeacherId.HasValue)
            {
                var teacherExists = await _context.Users
                    .AnyAsync(u => u.Id == dto.TeacherId.Value && u.Role == "Teacher");
                if(teacherExists == false)
                {
                    return BadRequest("Teacher not found...");
                }
            }
            //Check if subject with same code already exists
            if (!string.IsNullOrEmpty(dto.Code))
            {
                var exists = await _context.Subjects.AnyAsync(s => s.Code == dto.Code && s.ClassId == dto.ClassId);

                if (exists)
                {
                    return BadRequest($"Subject with {dto.Code} code is already exists in the class");
                }
            }

            var subject = new Subject
            {
                Name = dto.Name,
                Code = dto.Code,
                Description = dto.Description,
                ClassId = dto.ClassId,
                TeacherId = dto.TeacherId
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSuject), new { id = subject.Id }, subject);
        }

        [HttpPut("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> UpdateSubject(int id, UpdateSubjectDto dto)
        {
            var subject = await _context.Subjects.FindAsync(id);

            if (subject == null)
                return NotFound("Subject not found...");

            //Check if class exists
            var classExist = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
            if(classExist == false)
            {
                return BadRequest("Class not found...");
            }

            if (dto.TeacherId.HasValue)
            {
                var teacherExist = await _context.Users.AnyAsync(u => u.Id == dto.TeacherId && u.Role == "Teacher");
                if (!teacherExist)
                {
                    return BadRequest("Teacher has not been found...");
                }
            }

            subject.Name = dto.Name;
            subject.Code = dto.Code;
            subject.Description = dto.Description;
            subject.ClassId = dto.ClassId;
            subject.TeacherId = dto.TeacherId;

            await _context.SaveChangesAsync();

            return Ok(subject);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            var subject = await _context.Subjects
                .Include(s => s.Assignments)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
                return NotFound($"Subject with Id- {id} not found...");

            // Check if subject has any assignments asigned upon it
            if(subject.Assignments != null && subject.Assignments.Any())
            {
                return BadRequest("Cannot delete subjects having assignments");
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
