package ai

import (
	"encoding/json"
	"net/http"
)

// Main, AIHandler function
func AIHandler(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"upload_user_uuid":   "0195ab8b-22b2-7411-954c-f6762498b441",
		"source":             "https://www.kijiji.ca/v-cars-trucks/calgary/2020-toyota-rav4-xle/1713552694",
		"title":              "2020 Toyota RAV4 XLE",
		"price":              "28000",
		"dealer":             "private sale",
		"dealer_rating":      "5.0",
		"odometer":           "300000",
		"transmission":       "Automatic",
		"drivetrain":         "All-wheel drive (AWD)",
		"descr":              "2020 Toyota RAV4 XLE Premium with hail damage. Features include Apple/Android CARPLAY, remote starter, 3M paint protection film, lane assist, blindspot monitoring, heated seats, heated steering wheel, block heater, and active title. No accidents or collisions, no liens. One owner.",
		"specifications":     "Air conditioning, alloy wheels, Bluetooth, cruise control, navigation system, push button start, sunroof",
		"creation_date":      "unknown",
		"free_carfax":        "unknown",
		"vin":                "unknown",
		"condition":          "Used",
		"insurance_status":   "unknown",
		"recall_information": "unknown",
		"listing_summary":    "This listing is detailed and includes multiple photos and a comprehensive description of the vehicle's features and condition. The seller has a high rating and quick response time. Listing quality: 4.8/5.",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
