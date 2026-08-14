using System;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Services;
using AssignmentManagement.Data;
using AssignmentManagement.Models;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;

namespace AssignmentManagementTest.Services
{
    public class AuthServiceTests
    {
        [Fact]
        public void GenerateToken_ShouldReturnValidToken()
        {
            //Arrange
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Jwt:Secret"]).Returns("your-super-secret-key-for-testing-32chars");
            configMock.Setup(c => c["Jwt:Issuer"]).Returns("test-issuer");
            configMock.Setup(c => c["Jwt:Audience"]).Returns("test-audience");

            var jwtService = new JwtService(configMock.Object);

            var user = new User
            {
                Id = 1,
                Email = "test@test.com",
                FullName = "Test User",
                Role = "Student"
            };

            // Act
            var token = jwtService.GenerateToken(user);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);
        }
    }
}
