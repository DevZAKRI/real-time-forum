package chat

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"forum/app/models"
)

func GetMessages(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	sender := r.URL.Query().Get("sender")
	receiver := r.URL.Query().Get("receiver")

	limit := 10
	offset := r.URL.Query().Get("offset")

	if offset == "" {
		offset = "0"
	}

	rows, err := db.Query(`
		SELECT sender, receiver, content, timestamp 
		FROM messages 
		WHERE (senderID = ? AND receiver = ?) OR (sender = ? AND receiverID = ?) 
		ORDER BY timestamp DESC
		LIMIT ? OFFSET ?`,
		sender, receiver, receiver, sender, limit, offset)
	if err != nil {
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var msg models.Message
		err := rows.Scan(&msg.Sender, &msg.Receiver, &msg.Content, &msg.Timestamp)
		if err != nil {
			log.Printf("Error scanning message: sender=%s, receiver=%s, error=%v", sender, receiver, err)
			continue
		}
		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
