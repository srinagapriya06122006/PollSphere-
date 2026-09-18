package middleware

import (
	"net/http"

	"guvi-backend/internal/model"

	"github.com/gin-gonic/gin"
)

// RequireRole ensures that the authenticated caller has the specified role
func RequireRole(requiredRole model.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied: insufficient privileges",
			})
			c.Abort()
			return
		}

		userRole, ok := roleVal.(model.UserRole)
		if !ok || userRole != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied: administrator privileges required",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
