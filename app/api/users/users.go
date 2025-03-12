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
	// Get all users from the database arranged by last message sent/ recieved and rest alphabetically
	userID := r.URL.Query().Get("requester")
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

	rows, err := db.Query(query, userID, userID, userID)
	if err != nil {
		config.Logger.Printf("Error querying users: %v", err)
		models.SendErrorResponse(w, http.StatusInternalServerError, "Error: Internal server error")
		return
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var user User
		var id string
		err := rows.Scan(&id, &user.Username, &user.LastMessageAt)
		if err != nil {
			config.Logger.Printf("Error scanning user: %v", err)
			continue
		}
		if models.Clients[user.Username] != nil {
			user.IsOnline = true
		}
		users = append(users, user)
		config.Logger.Printf("Users: %v", users)
	}
	config.Logger.Printf("Number of users returned: %d Users: %v", len(users), users)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
