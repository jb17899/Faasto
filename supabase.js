import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.PROJECT_URL,process.env.PROJECT_ANON_KEY);
export default supabase;