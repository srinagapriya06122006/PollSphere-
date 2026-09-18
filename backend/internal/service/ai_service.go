package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"sort"
	"time"

	"guvi-backend/internal/model"
)

// AIService defines operations for generating AI-powered poll insights
type AIService interface {
	GeneratePollInsights(ctx context.Context, pollID string) (*model.AIInsightResponse, error)
}

type aiService struct {
	pollService PollService
	voteService VoteService
	apiKey      string
	httpClient  *http.Client
}

// NewAIService creates a new AIService instance
func NewAIService(pollService PollService, voteService VoteService) AIService {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("GOOGLE_API_KEY")
	}

	return &aiService{
		pollService: pollService,
		voteService: voteService,
		apiKey:      apiKey,
		httpClient:  &http.Client{Timeout: 15 * time.Second},
	}
}

// GeneratePollInsights analyzes vote patterns and returns structured findings
func (s *aiService) GeneratePollInsights(ctx context.Context, pollID string) (*model.AIInsightResponse, error) {
	poll, err := s.pollService.GetPollByID(ctx, pollID)
	if err != nil {
		return nil, err
	}

	results, err := s.voteService.GetPollResults(ctx, pollID, nil)
	if err != nil {
		return nil, err
	}

	if results.TotalVotes == 0 {
		return &model.AIInsightResponse{
			PollID:                   poll.ID,
			Question:                 poll.Question,
			TotalVotes:               0,
			WinningOption:            "N/A",
			WinningMargin:            "0%",
			ExecutiveSummary:         "This poll has not yet received any votes. Share the poll link or QR code to collect responses before generating AI insights.",
			KeyTakeaways:             []string{"Awaiting initial responses from participants.", "Share the QR code on social channels to begin collecting feedback."},
			VoteDistributionAnalysis: "Zero votes recorded across all available options.",
			Recommendations:          []string{"Promote this poll to relevant communities to gather a representative sample size."},
			ConfidenceScore:          1.0,
			GeneratedAt:              time.Now().UTC(),
		}, nil
	}

	// Identify leading option
	sortedOptions := make([]model.OptionResult, len(results.Results))
	copy(sortedOptions, results.Results)
	sort.Slice(sortedOptions, func(i, j int) bool {
		return sortedOptions[i].VoteCount > sortedOptions[j].VoteCount
	})
	leading := sortedOptions[0]

	// If Gemini API Key is configured, attempt real Gemini API call
	if s.apiKey != "" {
		if insight, err := s.queryGeminiAPI(ctx, poll, results, leading); err == nil {
			return insight, nil
		} else {
			slog.Warn("Gemini API call failed, falling back to intelligent statistical engine", "error", err)
		}
	}

	return s.generateHeuristicInsight(poll, results, sortedOptions), nil
}

func (s *aiService) queryGeminiAPI(ctx context.Context, poll *model.PollResponse, results *model.PollResultsResponse, leading model.OptionResult) (*model.AIInsightResponse, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", s.apiKey)

	optionsSummary := ""
	for _, opt := range results.Results {
		optionsSummary += fmt.Sprintf("- Option: '%s' | Votes: %d (%.1f%%)\n", opt.Text, opt.VoteCount, opt.Percentage)
	}

	prompt := fmt.Sprintf(`You are an expert data analyst. Analyze these live poll results:
Poll Question: "%s"
Category: %s
Status: %s
Total Votes: %d

Voting Distribution:
%s

Return ONLY valid JSON matching this exact structure without markdown formatting or backticks:
{
  "winningOption": "%s",
  "winningMargin": "e.g. +24.5%% lead",
  "executiveSummary": "Concise 2-sentence executive summary of the outcome",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "voteDistributionAnalysis": "Analysis of consensus vs fragmentation among options",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "confidenceScore": 0.95
}`, poll.Question, poll.Category, poll.Status, results.TotalVotes, optionsSummary, leading.Text)

	reqBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"responseMimeType": "application/json",
			"temperature":      0.2,
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gemini api returned status %d: %s", resp.StatusCode, string(body))
	}

	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from gemini")
	}

	rawJSON := geminiResp.Candidates[0].Content.Parts[0].Text

	var parsed struct {
		WinningOption            string   `json:"winningOption"`
		WinningMargin            string   `json:"winningMargin"`
		ExecutiveSummary         string   `json:"executiveSummary"`
		KeyTakeaways             []string `json:"keyTakeaways"`
		VoteDistributionAnalysis string   `json:"voteDistributionAnalysis"`
		Recommendations          []string `json:"recommendations"`
		ConfidenceScore          float64  `json:"confidenceScore"`
	}

	if err := json.Unmarshal([]byte(rawJSON), &parsed); err != nil {
		return nil, err
	}

	return &model.AIInsightResponse{
		PollID:                   poll.ID,
		Question:                 poll.Question,
		TotalVotes:               results.TotalVotes,
		WinningOption:            parsed.WinningOption,
		WinningMargin:            parsed.WinningMargin,
		ExecutiveSummary:         parsed.ExecutiveSummary,
		KeyTakeaways:             parsed.KeyTakeaways,
		VoteDistributionAnalysis: parsed.VoteDistributionAnalysis,
		Recommendations:          parsed.Recommendations,
		ConfidenceScore:          parsed.ConfidenceScore,
		GeneratedAt:              time.Now().UTC(),
	}, nil
}

func (s *aiService) generateHeuristicInsight(poll *model.PollResponse, results *model.PollResultsResponse, sorted []model.OptionResult) *model.AIInsightResponse {
	leading := sorted[0]
	var runnerUpPct float64
	var runnerUpText string
	if len(sorted) > 1 {
		runnerUpText = sorted[1].Text
		runnerUpPct = sorted[1].Percentage
	}

	marginPct := leading.Percentage - runnerUpPct
	marginStr := fmt.Sprintf("+%.1f%% lead", marginPct)

	var summary string
	var distAnalysis string
	var takeaways []string
	var recommendations []string

	if leading.Percentage >= 60.0 {
		summary = fmt.Sprintf("A decisive supermajority of voters (%.1f%%) selected '%s', leading the runner-up '%s' by a %.1f%% margin.", leading.Percentage, leading.Text, runnerUpText, marginPct)
		distAnalysis = fmt.Sprintf("Strong consensus observed. '%s' captured %d of %d total votes, showing high agreement among respondents.", leading.Text, leading.VoteCount, results.TotalVotes)
		takeaways = []string{
			fmt.Sprintf("'%s' holds clear majority dominance with %.1f%% of all votes.", leading.Text, leading.Percentage),
			fmt.Sprintf("Runner-up '%s' secured %.1f%% of votes.", runnerUpText, runnerUpPct),
			"Minimal voter fragmentation across remaining choices.",
		}
		recommendations = []string{
			fmt.Sprintf("Prioritize action on '%s' as the community's primary preference.", leading.Text),
			"Publish or share final results to conclude the discussion.",
		}
	} else if leading.Percentage >= 40.0 && marginPct >= 15.0 {
		summary = fmt.Sprintf("'%s' is the leading preference with %.1f%% of votes, maintaining a solid %.1f%% lead over '%s' (%.1f%%).", leading.Text, leading.Percentage, marginPct, runnerUpText, runnerUpPct)
		distAnalysis = fmt.Sprintf("Plurality preference with healthy engagement. '%s' leads with %d votes out of %d total cast.", leading.Text, leading.VoteCount, results.TotalVotes)
		takeaways = []string{
			fmt.Sprintf("'%s' is ahead by a noticeable %.1f%% margin.", leading.Text, marginPct),
			"Multiple choices received significant minority support.",
			"Voter interest is distributed across top contenders.",
		}
		recommendations = []string{
			fmt.Sprintf("Acknowledge strong secondary interest in '%s' while moving forward with '%s'.", runnerUpText, leading.Text),
			"Consider conducting a follow-up runoff if a strict 50%+ majority is required.",
		}
	} else {
		summary = fmt.Sprintf("Voters are closely divided. '%s' leads narrowly with %.1f%%, followed closely by '%s' at %.1f%% (margin: %.1f%%).", leading.Text, leading.Percentage, runnerUpText, runnerUpPct, marginPct)
		distAnalysis = "High distribution fragmentation. No single option commands a majority, indicating diverse voter opinions."
		takeaways = []string{
			fmt.Sprintf("Close contest between '%s' (%.1f%%) and '%s' (%.1f%%).", leading.Text, leading.Percentage, runnerUpText, runnerUpPct),
			"High degree of opinion variance among participants.",
			"A significant combined vote share went to non-winning options.",
		}
		recommendations = []string{
			"Conduct a 1-on-1 runoff vote between the top two contenders.",
			"Facilitate an open discussion to clarify key differentiators before final decisions.",
		}
	}

	return &model.AIInsightResponse{
		PollID:                   poll.ID,
		Question:                 poll.Question,
		TotalVotes:               results.TotalVotes,
		WinningOption:            leading.Text,
		WinningMargin:            marginStr,
		ExecutiveSummary:         summary,
		KeyTakeaways:             takeaways,
		VoteDistributionAnalysis: distAnalysis,
		Recommendations:          recommendations,
		ConfidenceScore:          0.92,
		GeneratedAt:              time.Now().UTC(),
	}
}
