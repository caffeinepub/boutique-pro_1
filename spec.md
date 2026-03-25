# Boutique Pro

## Current State
The app has a full backend with authorization (Internet Identity + role-based access), a product catalog with add/delete, and an AdminModal UI. However:
- Products returned from `getAllProducts` don't include their map keys (IDs), so delete and edit target wrong items when products are removed
- There is no `updateProduct` backend function (edit not supported)
- There is no UI to claim the initial admin role (no way to set up the admin account via the frontend)
- The AdminModal has no edit/inline editing for existing products

## Requested Changes (Diff)

### Add
- `updateProduct(id: Nat, product: BackendProduct)` in Motoko — admin only
- `id: Nat` field embedded in `BackendProduct` type so `getAllProducts` returns stable IDs
- Admin setup panel in AdminModal: after login, if no admin exists yet, show a token input so the first user can claim admin by calling `_initializeAccessControlWithSecret`
- Edit mode for each product in the admin product list (inline edit form or edit button that pre-fills the Add Product form)
- `useUpdateProduct` hook in `useQueries.ts`

### Modify
- `BackendProduct` Motoko type: add `id: Nat` field
- `addProduct`: store `id` inside the product struct
- `getAllProducts`: returns products with embedded `id` so frontend can use stable IDs
- `backend.d.ts`: add `id: bigint` to `BackendProduct`, add `updateProduct` signature
- `useGetProducts`: use `p.id` instead of array index
- `AdminModal`: add edit capability, add admin initialization flow

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko `BackendProduct` to include `id: Nat`; update `addProduct` to embed id; add `updateProduct`; update `getAllProducts` to return array sorted by id
2. Update `backend.d.ts` with new fields/methods
3. Update `useQueries.ts`: fix ID mapping, add `useUpdateProduct`
4. Update `AdminModal.tsx`: add admin init flow (secret token input), add edit button that pre-fills the form, wire `useUpdateProduct`
