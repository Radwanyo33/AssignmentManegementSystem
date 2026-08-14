using System;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Services;
using AssignmentManagement.Data;
using AssignmentManagement.Models;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace AssignmentManagementTest.Integration
{
    public class SubmissionWorkflowTests
    {
        [Fact]
        public async Task StudentSubmissionWorkflow_ShouldFollowCorrectFlow()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "WorkflowTest")
            .Options;
            using var context = new ApplicationDbContext(options);

            // Create teacher
            var teacher = new User { Id = 1, Email = "teacher@test.com", FullName = "Teacher", Role = "Teacher" };
            context.Users.Add(teacher);

            // Create student
            var student = new User { Id = 2, Email = "student@test.com", FullName = "Student", Role = "Student" };
            context.Users.Add(student);

            // Create assignment
            var assignment = new Assignment
            {
                Id = 1,
                Title = "Test Assignment",
                Description = "Test Description",
                Deadline = DateTime.UtcNow.AddDays(7),
                MaxMarks = 100,
                IsPublished = true,
                TeacherId = 1
            };
            context.Assignments.Add(assignment);

            await context.SaveChangesAsync();

            // Student submits
            var submission = new Submission
            {
                AssignmentId = 1,
                StudentId = 2,
                Answer = "Student answer",
                SubmittedAt = DateTime.UtcNow,
                Status = "Submitted"
            };
            context.Submissions.Add(submission);
            await context.SaveChangesAsync();

            // Verify submission
            var savedSubmission = await context.Submissions.FirstOrDefaultAsync(s => s.Id == submission.Id);
            Assert.NotNull(savedSubmission);
            Assert.Equal("Submitted", savedSubmission.Status);

            // Teacher grades
            savedSubmission.Marks = 85;
            savedSubmission.Feedback = "Good work!";
            savedSubmission.Status = "Graded";
            await context.SaveChangesAsync();

            // Verify grading
            var gradedSubmission = await context.Submissions.FirstOrDefaultAsync(s => s.Id == submission.Id);
            Assert.Equal("Graded", gradedSubmission.Status);
            Assert.Equal(85, gradedSubmission.Marks);
            Assert.Equal("Good work!", gradedSubmission.Feedback);
        }

    }
}
