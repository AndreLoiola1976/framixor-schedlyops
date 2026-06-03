import { IS_SUPABASE } from "@/lib/env";
import { mockAdapter } from "./mock";
import { supabaseAdapter, resetTenantCache } from "./supabase";
import type { DataSourceAdapter } from "./types";

export const dataSource: DataSourceAdapter = IS_SUPABASE ? supabaseAdapter : mockAdapter;

export { resetTenantCache };
export type * from "./types";
