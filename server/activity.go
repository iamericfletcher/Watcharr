package main

import (
	"errors"
	"log/slog"
	"time"

	"gorm.io/gorm"
)

type ActivityType string

var (
	ADDED_WATCHED         ActivityType = "ADDED_WATCHED"
	REMOVED_WATCHED       ActivityType = "REMOVED_WATCHED"
	RATING_CHANGED        ActivityType = "RATING_CHANGED"
	STATUS_CHANGED        ActivityType = "STATUS_CHANGED"
	THOUGHTS_CHANGED      ActivityType = "THOUGHTS_CHANGED"
	THOUGHTS_REMOVED      ActivityType = "THOUGHTS_REMOVED"
	IMPORTED_WATCHED      ActivityType = "IMPORTED_WATCHED"
	IMPORTED_RATING       ActivityType = "IMPORTED_RATING" // Imported rating, but with no rating acts as original import of content to old platform (where they are importing from) activity
	SEASON_ADDED          ActivityType = "SEASON_ADDED"
	SEASON_REMOVED        ActivityType = "SEASON_REMOVED"
	SEASON_RATING_CHANGED ActivityType = "SEASON_RATING_CHANGED"
	SEASON_STATUS_CHANGED ActivityType = "SEASON_STATUS_CHANGED"
)

type Activity struct {
	GormModel
	// ID of user this activity is linked to, so it can be easily
	// secured (users can only view their own activities).
	UserID uint `json:"-" gorm:"not null"`
	// ID of watched list item this activity is linked to.
	WatchedID uint `json:"watchedId" gorm:"not null"`
	// Type of activity.
	Type ActivityType `json:"type" gorm:"not null"`
	// Holds custom data (ex, if rating changed, this can
	// hold new rating - if status changed, this will hold that).
	Data string `json:"data" gorm:"not null"`
	// Custom date for the activity, that the user can define.
	CustomDate *time.Time `json:"customDate,omitempty"`
}

type ActivityAddRequest struct {
	WatchedID  uint         `json:"watchedId" binding:"required"`
	Type       ActivityType `json:"type" binding:"required"`
	Data       string       `json:"data" binding:"required"`
	CustomDate *time.Time   `json:"customDate,omitempty"`
}

func getActivity(db *gorm.DB, userId uint, watchedId uint) ([]Activity, error) {
	activity := new([]Activity)
	res := db.Model(&Activity{}).Where("user_id = ? AND watched_id = ?", userId, watchedId).Find(&activity)
	if res.Error != nil {
		slog.Error("Failed getting activity from database", "error", res.Error.Error())
		return []Activity{}, errors.New("failed getting activity")
	}
	return *activity, nil
}

func addActivity(db *gorm.DB, userId uint, ar ActivityAddRequest) (Activity, error) {
	if ar.WatchedID == 0 {
		return Activity{}, errors.New("watchedId must be set to add an activity")
	}
	activity := Activity{UserID: userId, WatchedID: ar.WatchedID, Type: ar.Type, Data: ar.Data, CustomDate: ar.CustomDate}
	res := db.Create(&activity)
	if res.Error != nil {
		slog.Error("Error adding activity to database", "error", res.Error.Error())
		return Activity{}, errors.New("failed adding new activity to database")
	}
	slog.Debug("Adding activity", "added_activity", activity)
	return activity, nil
}
