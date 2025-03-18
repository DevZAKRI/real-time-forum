package models

import (
	"encoding/json"
	"forum/app/config"
	"net/http"
)

type ErrorResponse struct {
	StatusCode int    `json:"statuscode"`
	Message    string `json:"message"`
}

func SendErrorResponse(resp http.ResponseWriter, statusCode int, message string) {
	resp.WriteHeader(statusCode)
	if statusCode == 404 || statusCode == 405 || statusCode == 403 {
		config.Logger.Println("Rendering ", statusCode, " section in home template")
		data := struct {
			IsError    bool
			StatusCode int
			Message    string
		}{
			IsError:    true,
			StatusCode: statusCode,
			Message:    message,
		}

		config.Templates.ExecuteTemplate(resp, "home.html", data)
		return
	} else {
		resp.Header().Set("Content-Type", "application/json")
		jsonResponse := ErrorResponse{
			StatusCode: statusCode,
			Message:    message}
		json.NewEncoder(resp).Encode(jsonResponse)
	}

}

func PreventCaching(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
}