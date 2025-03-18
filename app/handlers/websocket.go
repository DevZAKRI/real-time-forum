package handlers

import (
	"database/sql"
	"encoding/json"
	"forum/app/config"
	"forum/app/models"
	"forum/app/utils"
	"net/http"

	"github.com/gofrs/uuid"
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
	tabID, _ := uuid.NewV6()
	models.ClientsLock.Lock()
	models.Clients[userName] = append(models.Clients[userName], &models.Client{Conn: conn, UserID: id, TabID: tabID.String()})
	models.ClientsLock.Unlock()

	config.Logger.Printf("User Connected: %s (ID: %s, TabID: %s)", userName, id, tabID.String())

	setStatus(userName, "online", tabID.String())

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				config.Logger.Printf("User %s (TabID: %s) closed the connection", userName, tabID.String())
			} else {
				config.Logger.Printf("Read Message Error (User %s, TabID %s): %v", userName, tabID.String(), err)
			}
			break
		}

		config.Logger.Printf("Message received from %s (TabID: %s): %s", userName, tabID.String(), message)
		handleMessage(message, userName, id, db, tabID.String())
	}

	models.ClientsLock.Lock()
	newClientList := []*models.Client{}
	for _, client := range models.Clients[userName] {
		if client.TabID != tabID.String() {
			newClientList = append(newClientList, client)
		}
	}

	if len(newClientList) > 0 {
		models.Clients[userName] = newClientList
	} else {
		delete(models.Clients, userName)
		setStatus(userName, "offline", tabID.String())
	}

	models.ClientsLock.Unlock()
	config.Logger.Printf("User %s (TabID: %s) disconnected", userName, tabID.String())
}

func handleMessage(msgData []byte, username string, UserID string, db *sql.DB, tabID string) {
	var msg models.Message
	err := json.Unmarshal(msgData, &msg)
	if err != nil {
		config.Logger.Printf("Invalid JSON message from %s (TabID: %s): %v", username, tabID, err)
		return
	}
	exists := false
	msg.Sender = username
	msg.SenderID = UserID
	exists, msg.ReceiverID = checkReciever(msg.Receiver, db)
	if !exists {
		config.Logger.Printf("User %s (TabID: %s) not found: %s", username, tabID, msg.Receiver)
		return
	}
	if msg.Content == "" {
		config.Logger.Printf("Empty message from %s (TabID: %s) to %s", username, tabID, msg.Receiver)
		return
	}
	config.Logger.Printf("Message from %s (TabID: %s) to %s: %s", username, tabID, msg.Receiver, msg.Content)
	msg.Type = "message"
	_, err = db.Exec("INSERT INTO messages (sender, senderID, receiver, receiverID, content, timestamp, delivered) VALUES (?, ?, ?, ?, ?, ?, ?)",
		msg.Sender, msg.SenderID, msg.Receiver, msg.ReceiverID, msg.Content, msg.Timestamp, 0)
	if err != nil {
		config.Logger.Printf("Database Insert Error from %s (TabID: %s) to %s: %v", username, tabID, msg.Receiver, err)
		return
	}

	models.ClientsLock.Lock()
	defer models.ClientsLock.Unlock()

	if _, exists := models.Clients[msg.Receiver]; exists {
		msg.Own = false
		jsonMessage, _ := json.Marshal(msg)
		for _, recipientTab := range models.Clients[msg.Receiver] {
			err := recipientTab.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error sending message to %s (TabID: %s): %v", msg.Receiver, recipientTab.TabID, err)
				return
			} else {
				config.Logger.Printf("Message delivered to %s (TabID: %s)", msg.Receiver, recipientTab.TabID)
			}
		}

		db.Exec("UPDATE messages SET delivered = 1 WHERE sender = ? AND receiver = ?", username, msg.Receiver)
	}

	if _, exists := models.Clients[msg.Sender]; exists {
		msg.Own = true
		jsonMessage, _ := json.Marshal(msg)
		for _, senderTab := range models.Clients[msg.Sender] {
			err := senderTab.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error sending message to sender %s (TabID: %s): %v", msg.Sender, senderTab.TabID, err)
			} else {
				config.Logger.Printf("Message sent to sender %s (TabID: %s)", msg.Sender, senderTab.TabID)
			}
		}
	}
}

func setStatus(Username, status, tabID string) {
	models.ClientsLock.Lock()
	defer models.ClientsLock.Unlock()
	statusMsg := map[string]string{
		"type":   "status",
		"user":   Username,
		"status": status,
		"tabID":  tabID,
	}

	jsonMsg, _ := json.Marshal(statusMsg)

	for _, client := range models.Clients {
		for _, tab := range client {
			err := tab.Conn.WriteMessage(websocket.TextMessage, jsonMsg)
			if err != nil {
				config.Logger.Printf("Error broadcasting status update to %s (TabID: %s): %v", Username, tabID, err)
			} else {
				config.Logger.Printf("Status update sent to %s (TabID: %s): %s", Username, tabID, status)
			}
		}
	}
	config.Logger.Printf("User %s is now %s (TabID: %s)", Username, status, tabID)
}

func checkReciever(username string, db *sql.DB) (bool, string) {
	var userID string
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, ""
		}
		config.Logger.Printf("Error fetching user ID for %s: %v", username, err)
		return false, ""
	}
	return true, userID
}
