package internal

import (
	"fmt"
	"os"

	supa "github.com/nedpals/supabase-go"
)

func GetSupabaseClient() *supa.Client {

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		fmt.Println("missing SUPABASE_URL or SUPABASE_KEY environment variables")
		return nil
	}

	supabase := supa.CreateClient(supabaseURL, supabaseKey)

	return supabase

}
