# VIP Student Bundle - Frontend Integration Guide

This document explains the full **VIP Student Bundle** flow for frontend implementation, including:
- Admin dashboard screens and actions
- Student purchase flow (manual payment)
- API endpoints
- Request/response JSON examples
- Recommended UI prompts and status handling

---

## 1) Business Flow (End-to-End)

### Manual Payment Approval Flow
1. Student opens VIP Bundle page and sees current bundle price/config.
2. Student submits manual payment details (reference + screenshot URL/file link).
3. Backend creates `pending` VIP payment request.
4. Admin dashboard shows pending payment requests.
5. Admin approves or rejects each request.
6. On approval, user becomes `isVipStudent: true`.
7. VIP student can access all published courses + all batches.

### Admin Direct Role Flow
- Admin can directly set any user as VIP from dashboard (`isVipStudent: true`) or revoke VIP (`isVipStudent: false`).

---

## 2) Key Data Status Values

For VIP purchase record (`VipBundlePurchase.status`):
- `pending` → student submitted payment proof, waiting admin review
- `success` → admin approved payment
- `admin-assigned` → admin manually granted VIP role
- `rejected` → admin rejected payment request
- `revoked` → VIP was removed by admin

---

## 3) Authentication Header

All secure endpoints require:

```http
Authorization: Bearer <accessToken>
```

---

## 4) Admin Dashboard Requirements

## 4.1 VIP Bundle Config Page
Admin can set bundle title, description, fee, active/inactive state.

### API
- `GET /api/vip/bundle-config`
- `PUT /api/vip/bundle-config`

### UI Fields
- Title
- Description
- Price
- Currency (default BDT)
- Active switch

### Suggested Prompt Text
- Save success: **"VIP bundle configuration updated successfully."**
- Validation error: **"Please enter a valid bundle price."**

### Example Update Request
```json
{
  "title": "VIP Full Access Bundle",
  "description": "All courses + all batches",
  "price": 10000,
  "currency": "BDT",
  "isActive": true
}
```

### Example Response
```json
{
  "success": true,
  "message": "VIP bundle config saved successfully",
  "data": {
    "bundleKey": "VIP_STUDENT_BUNDLE",
    "title": "VIP Full Access Bundle",
    "description": "All courses + all batches",
    "price": 10000,
    "currency": "BDT",
    "isActive": true
  }
}
```

---

## 4.2 Pending VIP Payment Requests (Admin)

### API
- `GET /api/vip/pending-payments`
- `PATCH /api/vip/approve-payment/:purchaseId`
- `PATCH /api/vip/reject-payment/:purchaseId`

### Admin Table Columns
- Student Name
- Email
- User ID
- Amount
- Payment Reference
- Payment Screenshot (clickable)
- Submitted At
- Actions (Approve / Reject)

### Suggested Prompt Text
- Approve confirmation: **"Approve this payment and upgrade user to VIP?"**
- Reject confirmation: **"Reject this payment request?"**
- Approve success: **"Payment approved. User is now VIP Student."**
- Reject success: **"Payment request rejected successfully."**

### Reject Request Body (optional)
```json
{
  "reason": "Payment proof invalid"
}
```

### Approve Response Example
```json
{
  "success": true,
  "message": "VIP payment approved and user promoted to VIP student",
  "data": {
    "_id": "69b9740e0e6a03ebec7b9b3d",
    "status": "success",
    "approvedBy": "69a08189499d2fe7a93f21d5",
    "approvedAt": "2026-03-17T16:27:50.607Z"
  }
}
```

### Reject Response Example
```json
{
  "success": true,
  "message": "VIP payment rejected",
  "data": {
    "_id": "69b9740e0e6a03ebec7b9b3d",
    "status": "rejected",
    "rejectionReason": "Payment proof invalid"
  }
}
```

---

## 4.3 VIP Students List (Admin)

### API
- `GET /api/vip/students`

### UI Sections
- **VIP Users** list
- **VIP Purchase Records** list (success/admin-assigned)

### Suggested Prompt Text
- Empty state: **"No VIP students found yet."**

### Example Response
```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "_id": "69afc7be703e90caf1ed987e",
      "name": "studenthae",
      "email": "riyadkhan93700@gmail.com",
      "userId": "STU-260310-9A55",
      "role": "student",
      "isVipStudent": true
    }
  ],
  "purchases": [
    {
      "_id": "69b9740e0e6a03ebec7b9b3d",
      "status": "success",
      "amount": 10000,
      "paymentMethod": "manual"
    }
  ]
}
```

---

## 4.4 Admin Role Toggle From Dashboard
Admin can directly upgrade/downgrade VIP role.

### API
- `PATCH /api/vip/update-role/:userId`

### Request Body
```json
{
  "isVipStudent": true
}
```

or

```json
{
  "isVipStudent": false
}
```

### Suggested Prompt Text
- Promote confirm: **"Make this user VIP Student?"**
- Revoke confirm: **"Remove VIP access for this user?"**
- Success: **"VIP role updated successfully."**

### Example Response
```json
{
  "success": true,
  "message": "VIP role updated successfully",
  "data": {
    "_id": "69afc7be703e90caf1ed987e",
    "name": "studenthae",
    "email": "riyadkhan93700@gmail.com",
    "role": "student",
    "isVipStudent": true
  }
}
```

---

## 5) Student App Requirements

## 5.1 VIP Bundle Purchase Page

### API
- `GET /api/vip/bundle-config`
- `POST /api/vip/buy-bundle`

### UI Fields
- Payment Reference (text)
- Payment Screenshot/Proof URL (or file upload handled separately)

### Suggested Prompt Text
- Submit button: **"Submit Payment for Admin Approval"**
- Submit success: **"Your request is submitted and pending admin approval."**
- Already pending: **"Your payment request is already pending review."**
- Already VIP: **"You already have VIP access."**

### Request Example
```json
{
  "paymentReference": "TXN-MANUAL-7788",
  "paymentScreenshot": "https://example.com/payments/7788.png"
}
```

### Response Example
```json
{
  "success": true,
  "message": "VIP bundle payment request submitted. Please wait for admin approval.",
  "data": {
    "status": "pending",
    "amount": 10000,
    "paymentReference": "TXN-MANUAL-7788",
    "paymentScreenshot": "https://example.com/payments/7788.png"
  }
}
```

---

## 5.2 VIP Courses Access Page

### API
- `GET /api/vip/my-access`

### Behavior
- If VIP approved: show all published courses + their batches.
- If not VIP: show lock state and CTA to purchase VIP bundle.

### Suggested Prompt Text
- VIP success: **"VIP access granted to all courses and batches."**
- Not VIP: **"VIP bundle not purchased."**

### Response Example (Approved)
```json
{
  "success": true,
  "hasVipAccess": true,
  "message": "VIP access granted to all courses and all batches",
  "totalCourses": 1,
  "data": [
    {
      "_id": "69a5a43110c2c1805b26444e",
      "title": "Complete Web Development Bootcamp 2026",
      "slug": "cwdb2",
      "batchData": [
        {
          "_id": "69ac477a8e33b074a74b1582",
          "batchNo": 2,
          "status": "active"
        },
        {
          "_id": "69ac4c318e33b074a74b163b",
          "batchNo": 3,
          "status": "completed"
        }
      ]
    }
  ]
}
```

---

## 5.3 VIP All Batches Page

### API
- `GET /api/vip/all-batches`

### Use
- Build dedicated "All Batches" list for VIP students.

### Response Example
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "69ac477a8e33b074a74b1582",
      "batchNo": 2,
      "course": {
        "title": "Complete Web Development Bootcamp 2026",
        "slug": "cwdb2"
      },
      "status": "active"
    }
  ]
}
```

---

## 6) Optional Auth Endpoint (Admin creates VIP user account directly)

### API
- `POST /api/auth/vipstudent/register`

### Request
```json
{
  "name": "VipStudent User",
  "email": "vipstudent@example.com",
  "password": "vip123456"
}
```

### Response
```json
{
  "message": "VIP Student registered successfully",
  "user": {
    "id": "69b9740db85f9fddb532d274",
    "name": "VipStudent User",
    "email": "vipstudent@example.com",
    "role": "student",
    "isVipStudent": true,
    "userId": "VIP-260317-48F4"
  }
}
```

---

## 7) Frontend State Model (Recommended)

Use these states in UI for bundle purchase:
- `NOT_REQUESTED`
- `PENDING_APPROVAL`
- `APPROVED_VIP`
- `REJECTED`

Map from backend:
- `pending` => `PENDING_APPROVAL`
- `success`/`admin-assigned` => `APPROVED_VIP`
- `rejected` => `REJECTED`
- no record and not vip => `NOT_REQUESTED`

---

## 8) Admin Dashboard Component Suggestions

- `VipBundleConfigCard`
- `PendingVipPaymentsTable`
- `VipStudentsTable`
- `VipRoleToggleAction`

### Example Table Row JSON (pending)
```json
{
  "purchaseId": "69b9740e0e6a03ebec7b9b3d",
  "studentName": "studenthae",
  "email": "riyadkhan93700@gmail.com",
  "amount": 10000,
  "currency": "BDT",
  "paymentReference": "TXN-MANUAL-7788",
  "paymentScreenshot": "https://example.com/payments/7788.png",
  "status": "pending"
}
```

---

## 9) Error Handling Map (Frontend)

- `401` => token missing/expired → redirect login
- `403` => role or VIP access denied
- `404` => config/user/request not found
- `400` => validation/business rule (already pending, invalid input)
- `500` => show fallback toast: **"Something went wrong. Please try again."**

---

## 10) Quick Endpoint Checklist

### Admin
- [x] `PUT /api/vip/bundle-config`
- [x] `GET /api/vip/pending-payments`
- [x] `PATCH /api/vip/approve-payment/:purchaseId`
- [x] `PATCH /api/vip/reject-payment/:purchaseId`
- [x] `PATCH /api/vip/update-role/:userId`
- [x] `GET /api/vip/students`
- [x] `POST /api/auth/vipstudent/register`

### Student
- [x] `GET /api/vip/bundle-config`
- [x] `POST /api/vip/buy-bundle`
- [x] `GET /api/vip/my-access`
- [x] `GET /api/vip/all-batches`

---

## 11) Integration Sequence (Recommended)

1. Build Admin Bundle Config page.
2. Build Student VIP Purchase page.
3. Build Admin Pending Payments page with Approve/Reject actions.
4. Build Student VIP Courses/Batches pages.
5. Build Admin VIP Students page + Role Toggle.

---

## 12) Notes

- Current implementation uses manual proof submission fields in `buy-bundle`.
- For file upload screenshot, frontend can upload to cloud storage first and send URL in `paymentScreenshot`.
- VIP access depends on `User.isVipStudent` + admin approval flow.

---

If needed, next step can be adding a dedicated endpoint like `GET /api/vip/my-status` to return a single compact status payload for easier frontend state management.
