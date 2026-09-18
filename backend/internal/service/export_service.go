package service

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"time"
)

// ExportService handles file export formats for poll results
type ExportService interface {
	ExportPollToCSV(ctx context.Context, pollID string) ([]byte, string, error)
}

type exportService struct {
	pollService PollService
	voteService VoteService
}

// NewExportService creates a new ExportService
func NewExportService(pollService PollService, voteService VoteService) ExportService {
	return &exportService{
		pollService: pollService,
		voteService: voteService,
	}
}

// ExportPollToCSV creates a formatted CSV file buffer and recommended filename
func (s *exportService) ExportPollToCSV(ctx context.Context, pollID string) ([]byte, string, error) {
	poll, err := s.pollService.GetPollByID(ctx, pollID)
	if err != nil {
		return nil, "", err
	}

	results, err := s.voteService.GetPollResults(ctx, pollID, nil)
	if err != nil {
		return nil, "", err
	}

	buf := new(bytes.Buffer)
	writer := csv.NewWriter(buf)

	// Write Poll Metadata Header Block
	_ = writer.Write([]string{"Live Polling Application - Export Report"})
	_ = writer.Write([]string{"Generated At", time.Now().UTC().Format(time.RFC3339)})
	_ = writer.Write([]string{"Poll ID", poll.ID})
	_ = writer.Write([]string{"Question", poll.Question})
	_ = writer.Write([]string{"Category", string(poll.Category)})
	_ = writer.Write([]string{"Creator", poll.CreatorName})
	_ = writer.Write([]string{"Status", string(poll.Status)})
	_ = writer.Write([]string{"Total Votes Cast", fmt.Sprintf("%d", results.TotalVotes)})
	_ = writer.Write([]string{}) // Empty row separator

	// Write Tabular Option Breakdown
	_ = writer.Write([]string{"Option ID", "Option Text", "Vote Count", "Percentage (%)"})

	for _, opt := range results.Results {
		_ = writer.Write([]string{
			opt.OptionID,
			opt.Text,
			fmt.Sprintf("%d", opt.VoteCount),
			fmt.Sprintf("%.2f%%", opt.Percentage),
		})
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, "", fmt.Errorf("failed to generate CSV: %w", err)
	}

	filename := fmt.Sprintf("poll_results_%s.csv", poll.ID)
	return buf.Bytes(), filename, nil
}
