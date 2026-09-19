package config

import (
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config stores application-wide configuration loaded from environment variables
type Config struct {
	Port           string
	AppEnv         string
	GinMode        string
	MongoURI       string
	MongoDBName    string
	JWTSecret      string
	JWTExpiryHours time.Duration
	RedisAddr      string
	RedisPassword  string
	RedisDB        int
	RedisEnabled   bool
	GoogleClientID string
	GoogleClientSecret string
}

// LoadConfig initializes application configuration from .env or system environment
func LoadConfig() *Config {
	// Load .env file if it exists, but don't fail if it's missing (e.g. production/docker)
	if err := godotenv.Load(); err != nil {
		slog.Info("No .env file found, relying on system environment variables")
	}

	expiryHoursStr := getEnv("JWT_EXPIRY_HOURS", "24")
	expiryHours, err := strconv.Atoi(expiryHoursStr)
	if err != nil {
		expiryHours = 24
	}

	redisDBStr := getEnv("REDIS_DB", "0")
	redisDB, err := strconv.Atoi(redisDBStr)
	if err != nil {
		redisDB = 0
	}

	redisEnabledStr := getEnv("REDIS_ENABLED", "true")
	redisEnabled := redisEnabledStr == "true" || redisEnabledStr == "1"

	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		AppEnv:         getEnv("APP_ENV", "development"),
		GinMode:        getEnv("GIN_MODE", "debug"),
		MongoURI:       getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDBName:    getEnv("MONGO_DB_NAME", "polling_app"),
		JWTSecret:      getEnv("JWT_SECRET", "super_secret_jwt_key_default_replace_in_production"),
		JWTExpiryHours: time.Duration(expiryHours) * time.Hour,
		RedisAddr:      getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:  getEnv("REDIS_PASSWORD", ""),
		RedisDB:        redisDB,
		RedisEnabled:   redisEnabled,
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
	}

	return cfg
}

// getEnv retrieves an environment variable or returns a fallback default value
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}
