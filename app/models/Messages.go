package models

type Message struct {
	Type       string `json:"type"`
	Sender     string `json:"sender"`
	SenderID   string `json:"sender_id"`
	Receiver   string `json:"receiver"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
	Timestamp  string `json:"timestamp"`
}
