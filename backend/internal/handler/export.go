package handler

import (
	"fmt"
	"net/http"

	"guvi-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// ExportHandler handles export formats like CSV reports
type ExportHandler struct {
	exportService service.ExportService
}

// NewExportHandler creates a new ExportHandler instance
func NewExportHandler(exportService service.ExportService) *ExportHandler {
	return &ExportHandler{exportService: exportService}
}

// ExportCSV streams a downloadable CSV report of poll results
func (h *ExportHandler) ExportCSV(c *gin.Context) {
	pollID := c.Param("id")
	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poll ID is required"})
		return
	}

	csvData, filename, err := h.exportService.ExportPollToCSV(c.Request.Context(), pollID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Data(http.StatusOK, "text/csv; charset=utf-8", csvData)
}
