package models

type Message struct {
	Type      string `json:"type"`
	Sender    string `json:"sender"`
	Receiver  string `json:"receiver"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}
