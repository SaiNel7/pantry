import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { path, visitor_id } = await req.json();
  await supabase.from("page_views").insert({ path, visitor_id });
  return new Response(null, { status: 204 });
}
