package models

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn   *websocket.Conn
	UserID string
}

var (
	Clients     = make(map[string][]*Client)
	ClientsLock sync.Mutex
)
