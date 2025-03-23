package database

import (
	"encoding/json"
	"net/http"

	"github.com/MaiTra10/CarLens/api/internal"
)

type Listing struct {
	UploadUserUUID    string `json:"upload_user_uuid"`
	Source            string `json:"source"`
	Title             string `json:"title"`
	Price             string `json:"price"`
	Dealer            string `json:"dealer"`
	DealerRating      string `json:"dealer_rating"`
	Odometer          string `json:"odometer"`
	Transmission      string `json:"transmission"`
	Drivetrain        string `json:"drivetrain"`
	Descr             string `json:"descr"`
	Specifications    string `json:"specifications"`
	CreationDate      string `json:"creation_date"`
	FreeCarfax        string `json:"free_carfax"`
	VIN               string `json:"vin"`
	Condition         string `json:"condition"`
	InsuranceStatus   string `json:"insurance_status"`
	RecallInformation string `json:"recall_information"`
	ListingSummary    string `json:"listing_summary"`
}

func DBHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "HTTP Method Must Be POST", http.StatusMethodNotAllowed)
		return
	}

	supabase := internal.GetSupabaseClient()

	var dbResult []Listing
	err := supabase.DB.From("listings").Select("*").Execute(&dbResult)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//set replay header
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dbResult)

}
