using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Models;

namespace AssignmentManagement.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<ClassEnrollment> ClassEnrollments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Assignment Relationships
            modelBuilder.Entity<Assignment>(entity =>
            {
                entity.HasOne(a => a.Class)
                    .WithMany(c => c.Assignments)
                    .HasForeignKey(a => a.ClassId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Subject)
                    .WithMany(s => s.Assignments)
                    .HasForeignKey(a => a.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Teacher)
                    .WithMany(u => u.AssignmentsCreated)
                    .HasForeignKey(a => a.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(a => a.Submissions)
                    .WithOne(s => s.Assignment)
                    .HasForeignKey(s => s.AssignmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Class Relationships
            modelBuilder.Entity<Class>(entity =>
            {
                entity.HasOne(c => c.Teacher)
                    .WithMany(u => u.ClassesTaught)
                    .HasForeignKey(c => c.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Subject Relationships
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.HasOne(s => s.Class)
                    .WithMany(c => c.Subjects)
                    .HasForeignKey(s => s.ClassId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Teacher)
                    .WithMany()
                    .HasForeignKey(s => s.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Submission Relationships
            modelBuilder.Entity<Submission>(entity =>
            {
                entity.HasOne(s => s.Assignment)
                    .WithMany(a => a.Submissions)
                    .HasForeignKey(s => s.AssignmentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(s => s.Student)
                    .WithMany(u => u.Submissions)
                    .HasForeignKey(s => s.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Many-to-many relationship between Students and Classes
            modelBuilder.Entity<ClassEnrollment>()
                .HasOne(ce => ce.Student)
                .WithMany()
                .HasForeignKey(ce => ce.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassEnrollment>()
                .HasOne(ce => ce.Class)
                .WithMany()
                .HasForeignKey(ce => ce.ClassId)
                .OnDelete(DeleteBehavior.Restrict);

            // Unique constraint
            modelBuilder.Entity<ClassEnrollment>()
                .HasIndex(ce => new { ce.StudentId, ce.ClassId })
                .IsUnique();

            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            var admin = new User
            {
                Id = 1,
                Email = "admin@school.com",
                FullName = "Admin User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var teacher = new User
            {
                Id = 2,
                Email = "teacher@school.com",
                FullName = "John Smith",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),  // ✅ FIXED: Changed "Teaher" to "Teacher"
                Role = "Teacher",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var student = new User
            {
                Id = 3,
                Email = "student@school.com",
                FullName = "Marry Jane",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = "Student",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            modelBuilder.Entity<User>().HasData(admin, teacher, student);

            // Create classes
            var class10A = new Class
            {
                Id = 1,
                Name = "Class 10A",
                Description = "Grade 10 Section A",
                TeacherId = 2,
                CreatedAt = DateTime.UtcNow
            };

            var class12B = new Class
            {
                Id = 2,
                Name = "Class 12B",
                Description = "Grade 12 Section B",
                TeacherId = 2,
                CreatedAt = DateTime.UtcNow
            };

            modelBuilder.Entity<Class>().HasData(class10A, class12B);

            // Create subjects
            var math = new Subject
            {
                Id = 1,
                Name = "Mathematics",
                Code = "MATH101",
                ClassId = 1,
                TeacherId = 2
            };

            var physics = new Subject
            {
                Id = 2,
                Name = "Physics",
                Code = "PHY101",
                ClassId = 1,
                TeacherId = 2
            };

            var chemistry = new Subject
            {
                Id = 3,
                Name = "Chemistry",
                Code = "CHEM101",
                ClassId = 2,
                TeacherId = 2
            };

            modelBuilder.Entity<Subject>().HasData(math, physics, chemistry);
        }
    }
}