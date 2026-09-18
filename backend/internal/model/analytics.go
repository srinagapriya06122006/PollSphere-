package model

// CategoryCount holds the count of polls in a given category
type CategoryCount struct {
	Category string `json:"category"`
	Count    int64  `json:"count"`
}

// PopularPollItem represents high-engagement polls on the dashboard
type PopularPollItem struct {
	ID          string       `json:"id"`
	Question    string       `json:"question"`
	Category    PollCategory `json:"category"`
	TotalVotes  int64        `json:"totalVotes"`
	CreatorName string       `json:"creatorName"`
	Status      PollStatus   `json:"status"`
}

// DailyVoteTrend represents voting activity over recent days
type DailyVoteTrend struct {
	Date  string `json:"date"`
	Votes int64  `json:"votes"`
}

// TopUserLeaderboard represents most active users (creators / voters)
type TopUserLeaderboard struct {
	UserID    string `json:"userId"`
	UserName  string `json:"userName"`
	UserEmail string `json:"userEmail"`
	Score     int64  `json:"score"`
}

// AnalyticsOverviewResponse aggregates system-wide statistics for the dashboard
type AnalyticsOverviewResponse struct {
	TotalPolls           int64                `json:"totalPolls"`
	TotalVotes           int64                `json:"totalVotes"`
	ActivePolls          int64                `json:"activePolls"`
	ClosedPolls          int64                `json:"closedPolls"`
	TotalUsers           int64                `json:"totalUsers"`
	CategoryDistribution []CategoryCount      `json:"categoryDistribution"`
	PopularPolls         []PopularPollItem    `json:"popularPolls"`
	VoteTrend            []DailyVoteTrend     `json:"voteTrend"`
	TopCreators          []TopUserLeaderboard `json:"topCreators"`
	TopVoters            []TopUserLeaderboard `json:"topVoters"`
}
