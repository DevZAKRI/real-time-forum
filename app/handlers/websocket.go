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

	config.Logger.Printf("User Connected: %s", userName)

	setStatus(userName, "online", tabID.String())
	// deliverPendingMessages(userName, db)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				config.Logger.Printf("User %s closed the connection", userName)
			} else {
				config.Logger.Printf("Read Message Error: %v", err)
			}
			break
		}

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
	setStatus(userName, "offline", tabID.String())
	config.Logger.Printf("User Disconnected: %s", userName)
}

func handleMessage(msgData []byte, username string, UserID string, db *sql.DB, tabID string) {
	var msg models.Message
	err := json.Unmarshal(msgData, &msg)
	if err != nil {
		config.Logger.Printf("Invalid JSON message: %v", err)
		return
	}
	exists := false
	msg.Sender = username
	msg.SenderID = UserID
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
	jsonMessage, _ := json.Marshal(msg)
	if _, exists := models.Clients[msg.Receiver]; exists {
		for _, recipientTab := range models.Clients[msg.Receiver] {
			err := recipientTab.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error sending message to recipient: %v", err)
				return
			} else {
				config.Logger.Printf("Message delivered to %s", msg.Receiver)
			}
		}

		db.Exec("UPDATE messages SET delivered = 1 WHERE sender = ? AND receiver = ?", username, msg.Receiver)
	}

	if _, exists := models.Clients[msg.Sender]; exists {
		for _, senderTab := range models.Clients[msg.Sender] {
			err := senderTab.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
			if err != nil {
				config.Logger.Printf("Error sending message to sender: %v", err)
			}
		}
	}
}

// func deliverPendingMessages(userName string, db *sql.DB) {
// 	rows, err := db.Query("SELECT sender, senderID, receiver, receiverID, content, timestamp FROM messages WHERE receiver = ? AND delivered = 0", userName)
// 	if err != nil {
// 		config.Logger.Printf("Error fetching pending messages: %v", err)
// 		return
// 	}
// 	defer rows.Close()

// 	for rows.Next() {
// 		var msg models.Message
// 		err := rows.Scan(&msg.Sender, &msg.SenderID, &msg.Receiver, &msg.ReceiverID, &msg.Content, &msg.Timestamp)
// 		if err != nil {
// 			config.Logger.Printf("Error scanning pending message: %v", err)
// 			continue
// 		}
// 		msg.Type = "message"
// 		jsonMessage, _ := json.Marshal(msg)
// 		models.ClientsLock.Lock()
// 		if _, exists := models.Clients[msg.Receiver]; exists {
// 			for _, client := range models.Clients[msg.Receiver] {
// 				err := client.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
// 				if err != nil {
// 					config.Logger.Printf("Error delivering pending message: %v", err)
// 				}
// 			}

// 		}
// 		models.ClientsLock.Unlock()

// 		db.Exec("UPDATE messages SET delivered = 1 WHERE sender = ? AND receiver = ?", msg.Sender, msg.Receiver)
// 	}
// }

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
				config.Logger.Printf("Error broadcasting status update: %v", err)
			}
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
