package handlers

import (
	"database/sql"
	"forum/app/api/auth"
	"forum/app/api/chat"
	"forum/app/api/comments"
	"forum/app/api/posts"
	"forum/app/api/reactions"
	"forum/app/api/users"
	"forum/app/models"
	"forum/app/utils"
	"net/http"
	"strings"
)

func Router(resp http.ResponseWriter, req *http.Request, db *sql.DB) {
	path := strings.Split(req.URL.Path[5:], "/")
	if len(path) == 0 || path[0] == "" {
		models.SendErrorResponse(resp, http.StatusNotFound, "Page Not Found")
		return
	}

	switch strings.ToLower(path[0]) {
	case "auth":
		auth.Authentication(resp, req, db)
		return

	case "posts":
		sessionToken, err := utils.GetSessionToken(req)
		if err != nil || sessionToken == "" || !auth.SessionCheck(resp, req, db) {
			models.SendErrorResponse(resp, http.StatusUnauthorized, "Access: Unauthorized")
			return
		}
		if req.Method == http.MethodPost && len(path) > 1 && path[1] == "add" {
			posts.AddPost(resp, req, db)
			return
		}
		if req.Method == http.MethodGet {
			posts.GetPosts(resp, req, db)
			return
		}
		models.SendErrorResponse(resp, http.StatusMethodNotAllowed, "Error: Method not allowed")
		return

	case "comments":
		sessionToken, err := utils.GetSessionToken(req)
		if err != nil || sessionToken == "" || !auth.SessionCheck(resp, req, db) {
			models.SendErrorResponse(resp, http.StatusUnauthorized, "Access: Unauthorized")
			return
		}
		if req.Method == http.MethodPost {
			comments.AddComment(resp, req, db)
			return
		}
		models.SendErrorResponse(resp, http.StatusMethodNotAllowed, "Error: Method not allowed")
		return

	case "reactions":
		sessionToken, err := utils.GetSessionToken(req)
		if err != nil || sessionToken == "" || !auth.SessionCheck(resp, req, db) {
			models.SendErrorResponse(resp, http.StatusUnauthorized, "Access: Unauthorized")
			return
		}
		reactions.AddReaction(resp, req, db)
		return
	case "users":
		sessionToken, err := utils.GetSessionToken(req)
		if err != nil || sessionToken == "" || !auth.SessionCheck(resp, req, db) {
			models.SendErrorResponse(resp, http.StatusUnauthorized, "Access: Unauthorized")
			return
		}
		if req.Method != http.MethodGet {
			models.SendErrorResponse(resp, http.StatusMethodNotAllowed, "Error: Method not allowed")
			return
		}
		users.GetUsers(resp, req, db)
		return
	case "chat":
		sessionToken, err := utils.GetSessionToken(req)
		if err != nil || sessionToken == "" || !auth.SessionCheck(resp, req, db) {
			models.SendErrorResponse(resp, http.StatusUnauthorized, "Access: Unauthorized")
			return
		}
		if req.Method != http.MethodGet {
			models.SendErrorResponse(resp, http.StatusMethodNotAllowed, "Error: Method Not Allowed")
			return
		}
		chat.GetMessages(resp, req, db)
		return
	default:
		models.SendErrorResponse(resp, http.StatusNotFound, "Page Not Found")
		return
	}
}
