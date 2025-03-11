package handlers

import (
	"database/sql"
	"encoding/json"
	"forum/app/config"
	"forum/app/models"
	"forum/app/utils"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	Conn     *websocket.Conn
	Username string
	LastSeen time.Time
}

var (
	clients     = make(map[string]*Client)
	clientsLock sync.Mutex
)

func HandleConnections(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		config.Logger.Printf("WebSocket Upgrade Error: %v", err)
		return
	}
	defer conn.Close()

	sessionToken, _ := utils.GetSessionToken(r)
	_, userName, _ := utils.GetUsernameByToken(sessionToken, db)
	
	clientsLock.Lock()
	clients[userName] = &Client{Conn: conn, Username: userName, LastSeen: time.Now()}
	clientsLock.Unlock()

	config.Logger.Printf("User Connected: %s", userName)

	setStatus(userName, "online", db)
	deliverPendingMessages(userName, db)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				config.Logger.Printf("User %s closed the connection", userName)
			} else {
				config.Logger.Printf("Read Message Error: %v", err)
			}
			setStatus(userName, "offline", db)
			break
		}

		handleMessage(message, userName, db)
	}

	clientsLock.Lock()
	delete(clients, userName)
	clientsLock.Unlock()

	setStatus(userName, "offline", db)
	config.Logger.Printf("User Disconnected: %s", userName)
}

func handleMessage(msgData []byte, username string, db *sql.DB) {
	var msg models.Message
	err := json.Unmarshal(msgData, &msg)
	if err != nil {
		config.Logger.Printf("Invalid JSON message: %v", err)
		return
	}
	msg.Sender = username
	config.Logger.Printf("Message from %s to %s: %s", username, msg.Receiver, msg.Content)
	msg.Type = "message"
	_, err = db.Exec("INSERT INTO messages (sender, receiver, content, timestamp, delivered) VALUES (?, ?, ?, ?, ?)",
		username, msg.Receiver, msg.Content, msg.Timestamp, 0)
	if err != nil {
		config.Logger.Printf("Database Insert Error: %v", err)
		return
	}

	clientsLock.Lock()
	defer clientsLock.Unlock()

	if recipient, exists := clients[msg.Receiver]; exists {
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

func deliverPendingMessages(userID string, db *sql.DB) {
	rows, err := db.Query("SELECT sender, receiver, content, timestamp FROM messages WHERE receiver = ? AND delivered = 0", userID)
	if err != nil {
		config.Logger.Printf("Error fetching pending messages: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var msg models.Message
		err := rows.Scan(&userID, &msg.Receiver, &msg.Content, &msg.Timestamp)
		if err != nil {
			config.Logger.Printf("Error scanning pending message: %v", err)
			continue
		}
		msg.Type = "message"
		jsonMessage, _ := json.Marshal(msg)
		clientsLock.Lock()
		if client, exists := clients[userID]; exists {
			err := client.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error delivering pending message: %v", err)
			}
		}
		clientsLock.Unlock()

		db.Exec("UPDATE messages SET delivered = 1 WHERE sender = ? AND receiver = ?", userID, msg.Receiver)
	}
}

func setStatus(userID, status string, db *sql.DB) {
	clientsLock.Lock()
	defer clientsLock.Unlock()

	statusMsg := map[string]string{
		"type":   "status",
		"user":   userID,
		"status": status,
	}

	jsonMsg, _ := json.Marshal(statusMsg)

	for _, client := range clients {
		err := client.Conn.WriteMessage(websocket.TextMessage, jsonMsg)
		if err != nil {
			config.Logger.Printf("Error broadcasting status update: %v", err)
		}
	}
}
