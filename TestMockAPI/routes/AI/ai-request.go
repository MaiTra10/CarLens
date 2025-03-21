package ai

import (
	"encoding/json"
	"net/http"
)

// Main, AIHandler function
func AIHandler(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"upload_user_uuid":   "0195ab8b-22b2-7411-954c-f6762498b441",
		"source":             "https://www.autotrader.ca/a/Hyundai/Elantra%20GT/Calgary/AB/5_65656281_20190916130550228/?loc=T2A2L8&store=20190916130550228&gad_source=1&gclid=Cj0KCQjws-S-BhD2ARIsALssG0aK_c-iv9LwG8iTkgZyQMhlzJHUWQDx3yB7bjssYaRUAoK14DgPmiIaAsycEALw_wcB",
		"title":              "2018 Hyundai Elantra GT",
		"price":              "18995",
		"dealer":             "dealer",
		"dealer_rating":      "unknown",
		"odometer":           "unknown",
		"transmission":       "Automatic",
		"drivetrain":         "FWD",
		"descr":              "This 2018 Hyundai Elantra GT is a stylish and practical hatchback with a comfortable interior and great fuel efficiency. It comes with a range of features including a touchscreen infotainment system, Bluetooth connectivity, and more.",
		"specifications":     "unknown",
		"creation_date":      "unknown",
		"free_carfax":        "unknown",
		"vin":                "unknown",
		"condition":          "Used",
		"insurance_status":   "unknown",
		"recall_information": "unknown",
		"listing_summary":    "This listing provides a good overview of the car's features and condition. However, it lacks detailed information such as the odometer reading and dealer rating. Rating: 3.5/5",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
