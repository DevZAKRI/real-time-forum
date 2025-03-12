package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"forum/app/config"
	"forum/app/models"
	"forum/app/utils"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = 12

func Register(resp http.ResponseWriter, req *http.Request, db *sql.DB) {
	var (
		potentialUser models.UserCredentials
		userID        uuid.UUID
	)
	err := json.NewDecoder(req.Body).Decode(&potentialUser)
	if err != nil {
		config.Logger.Println("Register: Invalid request body:", err)
		models.SendErrorResponse(resp, http.StatusBadRequest, "Error: Invalid Request Format")
		return
	}
	fmt.Println("Register: ", potentialUser)
	valid, message, status := potentialUser.ValidInfo(resp, db)
	if !valid {
		models.SendErrorResponse(resp, status, message)
		return
	}

	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", potentialUser.Email).Scan(&exists)
	if err != nil {
		config.Logger.Println("Register: Database error checking existing user:", err)
		models.SendErrorResponse(resp, http.StatusInternalServerError, "Error: Internal Server Error")
		return
	}
	if exists {
		config.Logger.Println("Register: Email already registered:", potentialUser.Email)
		models.SendErrorResponse(resp, http.StatusConflict, "Error: Email already registered")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(potentialUser.Password), bcryptCost)
	if err != nil {
		config.Logger.Println("Register: Error hashing password:", err)
		models.SendErrorResponse(resp, http.StatusInternalServerError, "Error: Internal Server Error")
		return
	}
	userID, err = uuid.NewV6()
	if err != nil {
		config.Logger.Println("Register: Error generating UUID:", err)
		models.SendErrorResponse(resp, http.StatusInternalServerError, "Error: Internal Server Error")
		return
	}

	_, err = db.Exec(`
	INSERT INTO users (id, username, firstname, lastname, gender, age, email, password) 
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		userID.String(), potentialUser.Username, potentialUser.Firstname, potentialUser.Lastname, potentialUser.Gender, potentialUser.Age, potentialUser.Email, hashedPassword)
	if err != nil {
		config.Logger.Println("Register: Error inserting user into DB:", err)
		models.SendErrorResponse(resp, http.StatusInternalServerError, "Error: Internal Server Error")
		return
	}

	sessionToken, err := utils.ManageSession(db, userID.String(), potentialUser.Username)
	if err != nil {
		config.Logger.Println("Register: Error managing session:", err)
		models.SendErrorResponse(resp, http.StatusInternalServerError, "Error: Internal Server Error")
		return
	}

	http.SetCookie(resp, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(2 * time.Hour),
	})

	config.Logger.Println("Register: Successful registration for user:", potentialUser.Username, "UserID:", userID)

	resp.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(resp).Encode(map[string]string{"message": "Registration successful", "UserID": userID.String()})
}
