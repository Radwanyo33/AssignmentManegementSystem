using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Data;
namespace AssignmentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="Admin,Teacher")]
    public class ClassesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClassesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _context.Classes
                .Include(c => c.Teacher)
                .Include(c => c.Subjects)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    TeacherName = c.Teacher != null ? c.Teacher.FullName : null,
                    SujectCount = c.Subjects != null ? c.Subjects.Count() : 0
                }).ToListAsync();
            return Ok(classes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClass(int id)
        {
            var classEntity = await _context.Classes
                .Include(c => c.Teacher)
                .Include(c => c.Subjects)
                .FirstOrDefaultAsync(c => c.Id == id);

            if(classEntity == null)
            {
                return NotFound($"No classes found with class id {id}");
            }
            return Ok(classEntity);
        }
        [HttpPost]
        public async Task<IActionResult> CreateClass(CreateClassDto dto)
        {
            var classEntity = new Class
            {
                Name = dto.Name,
                Description = dto.Description,
                TeacherId = dto.TeacherId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Classes.Add(classEntity);
            await _context.SaveChangesAsync();

            return Ok(classEntity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClass(int id, UpdateClassDto dto)
        {
            var classEntity = await _context.Classes.FindAsync(id);
            if (classEntity == null)
                return NotFound($"Class with classId {id} is not being found...");

            classEntity.Name = dto.Name;
            classEntity.Description = dto.Description;
            classEntity.TeacherId = dto.TeacherId;

            await _context.SaveChangesAsync();
            return Ok(classEntity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            var classEntity = await _context.Classes.FindAsync(id);

            if(classEntity == null)
            {
                return NotFound($"Classes with classId {id} is not being found...");
            }

            _context.Classes.Remove(classEntity);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
