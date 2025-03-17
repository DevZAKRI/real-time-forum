package chat

import (
	"database/sql"
	"encoding/json"
	"forum/app/models"
	"net/http"
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
			continue // skip for now need to add error later, remember !!!!!!!!!
		}
		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
