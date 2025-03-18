package users

import (
	"database/sql"
	"encoding/json"
	"forum/app/config"
	"forum/app/models"
	"net/http"
)

type User struct {
	Username      string `json:"username"`
	LastMessageAt string `json:"last_message_at"`
	IsOnline      bool   `json:"isOnline"`
}

func GetUsers(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	config.Logger.Println("Getting all users")

	// Get user ID from query parameters
	userID := r.URL.Query().Get("requester")
	config.Logger.Printf("Request to get users by requester ID: %s", userID)

	// Prepare the query to fetch users and their last message timestamp
	query := `
		SELECT users.id, users.username, COALESCE(MAX(messages.timestamp), '') AS last_message_at
		FROM users
		LEFT JOIN messages 
			ON (users.id = messages.senderID OR users.id = messages.receiverID)
			AND (messages.senderID = ? OR messages.receiverID = ?)
		WHERE users.id != ?
		GROUP BY users.id, users.username
		ORDER BY last_message_at DESC, users.username ASC;
	`

	// Log the query being executed
	config.Logger.Printf("Executing query: %s", query)

	// Execute the query
	rows, err := db.Query(query, userID, userID, userID)
	if err != nil {
		config.Logger.Printf("Error querying users: %v", err)
		models.SendErrorResponse(w, http.StatusInternalServerError, "Error: Internal server error")
		return
	}
	defer rows.Close()

	// Initialize slice to store user information
	users := []User{}
	for rows.Next() {
		var user User
		var id string
		// Scan each row into a User struct
		err := rows.Scan(&id, &user.Username, &user.LastMessageAt)
		if err != nil {
			config.Logger.Printf("Error scanning user: %v", err)
			continue
		}

		// Check if user is online
		if models.Clients[user.Username] != nil {
			user.IsOnline = true
			config.Logger.Printf("User %s is online", user.Username)
		} else {
			user.IsOnline = false
			config.Logger.Printf("User %s is offline", user.Username)
		}

		// Append the user to the list
		users = append(users, user)
	}

	// Log the number of users returned and the users themselves
	config.Logger.Printf("Number of users returned: %d", len(users))
	config.Logger.Printf("Users: %v", users)

	// Send the response with the users data
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(users)
	if err != nil {
		config.Logger.Printf("Error encoding users to JSON: %v", err)
		models.SendErrorResponse(w, http.StatusInternalServerError, "Error: Unable to encode response")
	}
}
