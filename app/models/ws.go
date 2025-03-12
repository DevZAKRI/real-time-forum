package models

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn     *websocket.Conn
	UserID   string
	LastSeen time.Time
}

var (
	Clients     = make(map[string]*Client)
	ClientsLock sync.Mutex
)
