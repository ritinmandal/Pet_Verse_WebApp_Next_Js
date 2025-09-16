
import { createClient } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product, ProductDetail } from "@/types/product";


let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}


export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  }
});


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export async function getProductById(id: string): Promise<{
  product: Product | null;
  details: ProductDetail[];
}> {
  try {
    const supabase = getSupabaseClient();
    

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productError) {
      console.error("Error fetching product:", productError.message);
      return { product: null, details: [] };
    }


    const { data: details, error: detailsError } = await supabase
      .from("product_details")
      .select("*")
      .eq("product_id", id);

    if (detailsError) {
      console.error("Error fetching product details:", detailsError.message);
      return { product, details: [] };
    }

    return { product, details: details ?? [] };
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    return { product: null, details: [] };
  }
}
