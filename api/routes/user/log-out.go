package user

import (
	"fmt"
	"net/http"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "User has logged out!")
}
