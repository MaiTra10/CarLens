package internal

import (
	"os"

	supa "github.com/nedpals/supabase-go"
)

func GetSupabaseClient() *supa.Client {

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	supabase := supa.CreateClient(supabaseURL, supabaseKey)

	return supabase

}
