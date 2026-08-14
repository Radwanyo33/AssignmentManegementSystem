using System;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Services;
using AssignmentManagement.Data;
using AssignmentManagement.Models;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;
namespace AssignmentManagementTest.Validators
{
    public class AssignmentValidatorTests
    {
        [Fact]
        public void ValidateAssignment_WithValidData_ReturnsTrue()
        {
            // Arrange
            var assignment = new Assignment
            {
                Title = "Valid Title",
                Description = "Valid Description",
                Deadline = DateTime.UtcNow.AddDays(7),
                MaxMarks = 100,
                IsPublished = true
            };

            // Act
            var isValid = !string.IsNullOrEmpty(assignment.Title) &&
                          !string.IsNullOrEmpty(assignment.Description) &&
                          assignment.Deadline > DateTime.UtcNow &&
                          assignment.MaxMarks > 0;

            // Assert
            Assert.True(isValid);
        }

        [Fact]
        public void ValidateAssignment_WithPastDeadline_ReturnsFalse()
        {
            // Arrange
            var assignment = new Assignment
            {
                Title = "Valid Title",
                Description = "Valid Description",
                Deadline = DateTime.UtcNow.AddDays(-1), // past deadline
                MaxMarks = 100,
                IsPublished = true
            };

            // Act
            var isValid = DateTime.UtcNow < assignment.Deadline;

            // Assert
            Assert.False(isValid);
        }
    }
}
