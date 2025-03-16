package handlers

import (
	"database/sql"
	"encoding/json"
	"forum/app/config"
	"forum/app/models"
	"forum/app/utils"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleConnections(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		config.Logger.Printf("WebSocket Upgrade Error: %v", err)
		return
	}
	defer conn.Close()

	sessionToken, _ := utils.GetSessionToken(r)
	id, userName, _ := utils.GetUsernameByToken(sessionToken, db)

	models.ClientsLock.Lock()
	models.Clients[userName] = &models.Client{Conn: conn, UserID: id}
	models.ClientsLock.Unlock()

	config.Logger.Printf("User Connected: %s", userName)

	setStatus(userName, "online")
	deliverPendingMessages(userName, db)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				config.Logger.Printf("User %s closed the connection", userName)
			} else {
				config.Logger.Printf("Read Message Error: %v", err)
			}
			setStatus(userName, "offline")
			break
		}

		handleMessage(message, userName, id, db)
	}

	models.ClientsLock.Lock()
	delete(models.Clients, userName)
	models.ClientsLock.Unlock()

	setStatus(userName, "offline")
	config.Logger.Printf("User Disconnected: %s", userName)
}

func handleMessage(msgData []byte, username string, UserID string, db *sql.DB) {
	var msg models.Message
	err := json.Unmarshal(msgData, &msg)
	if err != nil {
		config.Logger.Printf("Invalid JSON message: %v", err)
		return
	}
	exists := false
	msg.Sender = username
	msg.SenderID = UserID

	switch msg.Type {
	case "typing", "stopped_typing":
		models.ClientsLock.Lock()
		if recipient, exists := models.Clients[msg.Receiver]; exists {
			jsonMessage, _ := json.Marshal(msg)
			err := recipient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error sending typing event: %v", err)
			}
		}
		models.ClientsLock.Unlock()

	case "message":
		exists, msg.ReceiverID = checkReciever(msg.Receiver, db)
		if !exists {
			config.Logger.Printf("User %s not found", msg.Receiver)
			return
		}
		if msg.Content == "" {
			config.Logger.Printf("Empty message from %s to %s", username, msg.Receiver)
			return
		}
		// var msgTime time.Time
		config.Logger.Printf("Message from %s to %s: %s", username, msg.Receiver, msg.Content)
		msg.Type = "message"
		_, err = db.Exec("INSERT INTO messages (sender, senderID, receiver, receiverID, content, timestamp, delivered) VALUES (?, ?, ?, ?, ?, ?, ?)",
			msg.Sender, msg.SenderID, msg.Receiver, msg.ReceiverID, msg.Content, msg.Timestamp, 0)
		if err != nil {
			config.Logger.Printf("Database Insert Error: %v", err)
			return
		}
	
		models.ClientsLock.Lock()
		defer models.ClientsLock.Unlock()
	
		if recipient, exists := models.Clients[msg.Receiver]; exists {
			jsonMessage, _ := json.Marshal(msg)
			err := recipient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error sending message to recipient: %v", err)
				return
			} else {
				config.Logger.Printf("Message delivered to %s", msg.Receiver)
			}
			db.Exec("UPDATE messages SET delivered = 1 WHERE sender = ? AND receiver = ?", username, msg.Receiver)
		}
	}
}

func deliverPendingMessages(userName string, db *sql.DB) {
	rows, err := db.Query("SELECT sender, senderID, receiver, receiverID, content, timestamp FROM messages WHERE receiver = ? AND delivered = 0", userName)
	if err != nil {
		config.Logger.Printf("Error fetching pending messages: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var msg models.Message
		err := rows.Scan(&msg.Sender, &msg.SenderID, &msg.Receiver, &msg.ReceiverID, &msg.Content, time.Now())
		if err != nil {
			config.Logger.Printf("Error scanning pending message: %v", err)
			continue
		}
		msg.Type = "message"
		jsonMessage, _ := json.Marshal(msg)
		models.ClientsLock.Lock()
		if client, exists := models.Clients[msg.Receiver]; exists {
			err := client.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error delivering pending message: %v", err)
			}
		}
		models.ClientsLock.Unlock()

		db.Exec("UPDATE messages SET delivered = 1 WHERE sender = ? AND receiver = ?", msg.Sender, msg.Receiver)
	}
}

func setStatus(Username, status string) {
	models.ClientsLock.Lock()
	defer models.ClientsLock.Unlock()

	statusMsg := map[string]string{
		"type":   "status",
		"user":   Username,
		"status": status,
	}

	jsonMsg, _ := json.Marshal(statusMsg)

	for _, client := range models.Clients {
		err := client.Conn.WriteMessage(websocket.TextMessage, jsonMsg)
		if err != nil {
			config.Logger.Printf("Error broadcasting status update: %v", err)
		}
	}
	config.Logger.Printf("User %s is now %s", Username, status)
}

func checkReciever(username string, db *sql.DB) (bool, string) {
	var userID string
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, ""
		}
		config.Logger.Printf("Error fetching user ID: %v", err)
		return false, ""
	}
	return true, userID
}
