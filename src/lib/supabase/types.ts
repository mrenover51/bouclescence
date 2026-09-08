export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus = "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type InventoryMovementType = "initial" | "manual_adjustment" | "sale" | "refund" | "return" | "cancellation";

export type ProductRow = { id:string; name:string; slug:string; short_description:string|null; description:string|null; status:ProductStatus; price:number; compare_at_price:number|null; sku:string|null; stock_tracking:boolean; stock_quantity:number; low_stock_threshold:number; is_unique_piece:boolean; featured:boolean; seo_title:string|null; seo_description:string|null; created_at:string; updated_at:string };
export type ProductImageRow = { id:string; product_id:string; storage_path:string; alt_text:string|null; sort_order:number; is_primary:boolean; created_at:string };
export type ProductVariantRow = { id:string; product_id:string; name:string; options:Json; sku:string; price:number|null; stock_tracking:boolean; stock_quantity:number; low_stock_threshold:number|null; is_active:boolean; sort_order:number; created_at:string; updated_at:string };
export type CollectionRow = { id:string; name:string; slug:string; description:string|null; image_path:string|null; is_active:boolean; sort_order:number; created_at:string; updated_at:string };
export type InventoryMovementRow = { id:string; product_id:string; variant_id:string|null; movement_type:InventoryMovementType; quantity_before:number; quantity_change:number; quantity_after:number; reason:string; reference:string|null; performed_by:string|null; created_at:string };
type Insert<T> = Partial<T>;
type Table<T> = { Row:T; Insert:Insert<T>; Update:Insert<T>; Relationships: [] };
export type Database = { public: { Tables: {
  profiles: Table<{id:string; role:"customer"|"admin"; full_name:string|null; created_at:string; updated_at:string}>;
  products: Table<ProductRow>; product_images: Table<ProductImageRow>; product_variants: Table<ProductVariantRow>; collections: Table<CollectionRow>;
  collection_products: Table<{collection_id:string; product_id:string; sort_order:number; created_at:string}>;
  inventory_movements: Table<InventoryMovementRow>;
  customers: Table<{id:string; auth_user_id:string|null; email:string; first_name:string|null; last_name:string|null; phone:string|null; marketing_consent:boolean; created_at:string; updated_at:string}>;
  addresses: Table<{id:string; customer_id:string; type:"shipping"|"billing"; first_name:string; last_name:string; company:string|null; line1:string; line2:string|null; postal_code:string; city:string; country_code:string; phone:string|null; created_at:string; updated_at:string}>;
  orders: Table<{id:string; order_number:string; customer_id:string|null; status:OrderStatus; email:string; currency:string; subtotal:number; discount_total:number; shipping_total:number; tax_total:number; total:number; shipping_address:Json; billing_address:Json; tracking_number:string|null; tracking_url:string|null; stripe_checkout_session_id:string|null; stripe_payment_intent_id:string|null; paid_at:string|null; created_at:string; updated_at:string}>;
  order_items: Table<{id:string; order_id:string; product_id:string|null; variant_id:string|null; product_name:string; variant_name:string|null; sku:string|null; unit_price:number; quantity:number; total:number; created_at:string}>;
  discount_codes: Table<{id:string; code:string; type:"percentage"|"fixed_amount"; value:number; minimum_amount:number|null; usage_limit:number|null; times_used:number; starts_at:string|null; ends_at:string|null; is_active:boolean; created_at:string; updated_at:string}>;
  site_settings: Table<{key:string; value:Json; description:string|null; is_public:boolean; created_at:string; updated_at:string}>;
}; Views: Record<string, never>; Functions: { adjust_inventory: { Args: { p_product_id:string; p_variant_id?:string|null; p_quantity_change:number; p_reason:string; p_reference?:string|null; p_movement_type?:InventoryMovementType; p_allow_unique_override?:boolean }; Returns:InventoryMovementRow }; sync_product_images: { Args: { p_product_id:string; p_image_ids:string[]; p_primary_id?:string|null; p_alt_texts?:string[] }; Returns:string[] }; is_admin: { Args: Record<PropertyKey, never>; Returns:boolean }; next_order_number: { Args: Record<PropertyKey, never>; Returns:string } }; Enums: { user_role:"customer"|"admin"; product_status:ProductStatus; order_status:OrderStatus; inventory_movement_type:InventoryMovementType; discount_type:"percentage"|"fixed_amount" }; CompositeTypes: Record<string, never> } };
