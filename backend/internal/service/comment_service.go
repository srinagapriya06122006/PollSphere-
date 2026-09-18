package service

import (
	"context"
	"errors"
	"strings"

	"guvi-backend/internal/model"
	"guvi-backend/internal/repository"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type CommentService interface {
	AddComment(ctx context.Context, pollID, userID, userName, userEmail, content string) (*model.PollComment, error)
	GetComments(ctx context.Context, pollID string) ([]model.PollComment, error)
}

type commentService struct {
	commentRepo repository.CommentRepository
	pollRepo    repository.PollRepository
}

func NewCommentService(commentRepo repository.CommentRepository, pollRepo repository.PollRepository) CommentService {
	return &commentService{
		commentRepo: commentRepo,
		pollRepo:    pollRepo,
	}
}

func (s *commentService) AddComment(ctx context.Context, pollID, userID, userName, userEmail, content string) (*model.PollComment, error) {
	trimmed := strings.TrimSpace(content)
	if trimmed == "" {
		return nil, errors.New("comment content cannot be empty")
	}
	if len(trimmed) > 500 {
		return nil, errors.New("comment exceeds maximum 500 characters")
	}

	objID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, errors.New("invalid poll ID")
	}

	// Verify poll exists
	_, err = s.pollRepo.FindByID(ctx, objID)
	if err != nil {
		return nil, errors.New("poll not found")
	}

	comment := &model.PollComment{
		PollID:    pollID,
		UserID:    userID,
		UserName:  userName,
		UserEmail: userEmail,
		Content:   trimmed,
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}

func (s *commentService) GetComments(ctx context.Context, pollID string) ([]model.PollComment, error) {
	return s.commentRepo.GetByPollID(ctx, pollID)
}
