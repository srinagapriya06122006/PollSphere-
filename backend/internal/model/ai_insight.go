package model

import "time"

// AIInsightResponse represents structured AI-generated analysis of poll voting patterns
type AIInsightResponse struct {
	PollID                   string    `json:"pollId"`
	Question                 string    `json:"question"`
	TotalVotes               int64     `json:"totalVotes"`
	WinningOption            string    `json:"winningOption"`
	WinningMargin            string    `json:"winningMargin"`
	ExecutiveSummary         string    `json:"executiveSummary"`
	KeyTakeaways             []string  `json:"keyTakeaways"`
	VoteDistributionAnalysis string    `json:"voteDistributionAnalysis"`
	Recommendations          []string  `json:"recommendations"`
	ConfidenceScore          float64   `json:"confidenceScore"`
	GeneratedAt              time.Time `json:"generatedAt"`
}
