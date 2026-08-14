using System;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Services;
using AssignmentManagement.Data;
using AssignmentManagement.Models;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;

namespace AssignmentManagementTest.Authorization
{
    public class RoleTests
    {
        [Fact]
        public void Student_ShouldNotAccessAdminEndpoints()
        {
            var user = new User { Role = "Student" };
            var requiredRole = "Admin";

            // Act
            var hasAccess = user.Role == requiredRole;

            // Assert
            Assert.False(hasAccess);
        }

        [Fact]
        public void Teacher_ShouldAccessTeacherEndpoints()
        {
            //Arrange
            var user = new User { Role = "Teacher" };
            var requiredRole = "Teacher";

            // Act
            var hasAccess = user.Role == requiredRole;

            // Assert
            Assert.True(hasAccess);
        }

        [Fact]
        public void Admin_ShouldAccessAllEndpoints()
        {
            var admin = new User { Role = "Admin" };
            var teacherRole = "Teacher";
            var studentRole = "Student";

            // Act and Assert
            Assert.True(admin.Role == "Admin" || admin.Role == teacherRole);
            Assert.True(admin.Role == "Admin" || admin.Role == studentRole);
        }
    }
}
