# Standard Operating Procedure (SOP): Calling System

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Entity Onboarding](#entity-onboarding)
3. [Agent Management](#agent-management)
4. [Initiating Calls](#initiating-calls)
5. [Call Monitoring](#call-monitoring)
6. [Troubleshooting](#troubleshooting)

---

## 1. System Overview

### Purpose
This system enables secure, tracked outbound calling through a third-party provider with complete backend control over sensitive data.

### Key Components
- **Entities**: Organizations using the calling service
- **IVRs**: Phone numbers assigned to entities
- **Agents**: Users who make calls on behalf of entities
- **Call Logs**: Historical record of all calls

### Security Model
**Zero-Trust Frontend**: The frontend can ONLY send customer information. All agent/IVR data is fetched backend-side.

---

## 2. Entity Onboarding

### Step 2.1: Create Entity

**Performed by**: System Administrator

**API Endpoint**: `POST /entity/create`

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+15551234567",
  "address": "123 Main St",
  "companyId": "ACME001",
  "description": "Sales and support calls"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "67890abc...",
    "name": "Acme Corporation",
    "status": "PENDING",
    ...
  }
}
```

**Notes**:
- Entity starts in `PENDING` status
- Entity becomes `ACTIVE` after verification

---

### Step 2.2: Create API Key

**Performed by**: System Administrator

**API Endpoint**: `POST /api-key/create`

**Request Body**:
```json
{
  "entityId": "67890abc...",
  "name": "Production API Key"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "key123...",
    "rawKey": "a1b2c3d4e5f6...", 
    "name": "Production API Key"
  }
}
```

**⚠️ CRITICAL**:
- `rawKey` is shown ONLY ONCE
- Store securely
- Never expose to frontend

---

### Step 2.3: Register with Provider

**Performed by**: System Administrator (Manual)

**Steps**:
1. Log into provider's admin panel
2. Create new company/entity
3. Note the assigned `companyId` from provider
4. Store provider's API credentials (if different from stored key)

---

### Step 2.4: Sync IVR Numbers

**Performed by**: System Administrator

**API Endpoint**: `POST /entity/sync-ivrs`

**Request Body**:
```json
{
  "entity_id": "67890abc..."
}
```

**Expected Response**:
```json
{
  "success": true,
  "entity": "Acme Corporation",
  "synced": {
    "created": 3,
    "updated": 0,
    "total": 3
  }
}
```

**What Happens**:
1. Backend calls provider's `getdeskphone_v2` API
2. Fetches all IVR numbers assigned to entity
3. Stores in local `ivrs` collection
4. Links each IVR to the entity

**When to Run**:
- After entity setup
- When provider assigns new IVRs
- Periodically (e.g., daily cron job)

---

## 3. Agent Management

### Step 3.1: Create Agent

**Performed by**: Entity Administrator

**API Endpoint**: `POST /agents/create`

**Request Body**:
```json
{
  "entity_id": "67890abc...",
  "name": "John Doe",
  "phone": "+15559876543"
}
```

**Backend Process**:
1. Validates entity exists
2. Calls provider's `addmember_v2` API
3. Receives `member_id` from provider
4. Stores agent locally with:
   - `agent_id`: Random 7-digit number
   - `user_id`: Provider's `member_id`
   - `phone`: Agent's phone number
   - `deskphone`: NULL (assigned later)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "member_id": "USER001",
    "member_name": "John Doe",
    ...
  }
}
```

---

### Step 3.2: Assign IVR to Agent

**Performed by**: Entity Administrator

**API Endpoint**: `POST /agents/link-did`

**Request Body**:
```json
{
  "member_id": "USER001",
  "deskphone": "18005550001"
}
```

**Validation**:
- IVR must exist in local database
- IVR must belong to the same entity
- IVR cannot be assigned to multiple agents (unless explicitly allowed)

**What Happens**:
1. Updates agent record: `deskphone = "18005550001"`
2. Agent is now ready to make calls

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "agent123...",
    "deskphone": "18005550001",
    ...
  }
}
```

---

## 4. Initiating Calls

### Step 4.1: Frontend: Click-to-Call

**Performed by**: End User (via Frontend UI)

**API Endpoint**: `POST /click-to-call`

**Request Body**:
```json
{
  "agentId": "agent123...",
  "calling_party_b": "+15551112222",
  "entityId": "67890abc..."
}
```

**⚠️ Frontend sends ONLY**:
- `agentId`: Which agent is calling
- `calling_party_b`: Customer to call
- `entityId`: Entity context

**🔒 Backend Fetches**:
- `calling_party_a` ← `agent.phone`
- `deskphone` ← `agent.deskphone`
- `authcode` ← Entity's API key

---

### Step 4.2: Backend Processing

````mermaid
graph TD
    A[Receive Request] --> B{Validate agentId}
    B -->|Not Found| C[❌ Error: Agent not found]
    B -->|Found| D{Check agent.phone}
    
    D -->|Missing| E[❌ Error: Phone not assigned]
    D -->|Exists| F{Check agent.deskphone}
    
    F -->|Missing| G[❌ Error: IVR not assigned]
    F -->|Exists| H{Verify entity ownership}
    
    H -->|Mismatch| I[❌ Error: Agent wrong entity]
    H -->|Match| J[Get API Key]
    
    J --> K[Create CallLog<br/>status: INITIATED]
    K --> L[Call Provider API]
    
    L --> M{Provider Response}
    M -->|Success| N[Update CallLog<br/>status: RINGING]
    M -->|Failure| O[Keep status: INITIATED]
    
    N --> P[✅ Return Success]
    O --> Q[❌ Return Error]
````

---

### Step 4.3: Expected Response

**Success**:
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "data": {
    "call_id": "CALL123456",
    "status": "initiated"
  }
}
```

**Failure Examples**:

| Error | Reason | Fix |
|-------|--------|-----|
| `Agent not found` | Invalid `agentId` | Verify agent exists |
| `Agent does not have a phone number` | Agent created without phone | Update agent with phone |
| `Agent does not have a deskphone assigned` | IVR not linked | Link IVR to agent |
| `Agent does not belong to this entity` | Wrong `entityId` | Use correct entity context |

---

## 5. Call Monitoring

### Step 5.1: View Call Logs

**API Endpoint**: `GET /call-logs` (to be implemented)

**Expected Data**:
```json
{
  "callLogs": [
    {
      "_id": "log123...",
      "callId": "CALL123456",
      "entity": "Acme Corporation",
      "agent": "John Doe",
      "customerNumber": "+15551112222",
      "ivrNumber": "18005550001",
      "status": "COMPLETED",
      "duration": 125,
      "createdAt": "2026-01-20T10:30:00Z"
    }
  ]
}
```

---

### Step 5.2: Webhook Processing

**What Happens**:
1. Provider sends webhook when call status changes
2. Backend receives `POST /webhooks/call`
3. Backend finds CallLog by `call_id`
4. Updates `status` and `duration`

**Status Flow**:
```
INITIATED → RINGING → ANSWERED → COMPLETED
           ↘ FAILED / BUSY / NO_ANSWER
```

---

## 6. Troubleshooting

### Issue: "Agent does not have a deskphone assigned"

**Diagnosis**:
```bash
# Check agent record
db.agents.findOne({_id: "agent123..."})
```

**Fix**:
```bash
POST /agents/link-did
{
  "member_id": "USER001",
  "deskphone": "18005550001"
}
```

---

### Issue: "No active API Key found for this entity"

**Diagnosis**:
```bash
# Check API keys
db.apikeys.find({entity: "67890abc...", isActive: true})
```

**Fix**:
- Create new API key if missing
- Activate existing key if inactive

---

### Issue: Call fails but no error

**Check**:
1. Provider API logs
2. CallLog `status` field
3. Network connectivity

**Debug**:
```bash
# View recent call logs
db.calllogs.find().sort({createdAt: -1}).limit(10)
```

---

## 7. Best Practices

### ✅ DO
- Sync IVRs daily (automated cron job)
- Monitor CallLog for failed calls
- Validate agent-IVR assignment before allowing calls
- Log all API errors for debugging

### ❌ DON'T
- Send agent phone numbers from frontend
- Hardcode API keys in frontend
- Skip entity ownership validation
- Ignore webhook updates

---

## 8. System Maintenance

### Daily Tasks
- [ ] Check webhook processing errors
- [ ] Review failed calls in CallLog
- [ ] Verify API key expiration (if applicable)

### Weekly Tasks
- [ ] Sync IVRs for all entities
- [ ] Clean up old call logs (>90 days)
- [ ] Review agent-IVR assignments

### Monthly Tasks
- [ ] Audit entity status (PENDING → ACTIVE)
- [ ] Rotate API keys (if security policy requires)
- [ ] Performance review of call success rate

---

## 9. Quick Reference

### Frontend API Call (Minimal Input)
```javascript
const makeCall = async (agentId, customerNumber, entityId) => {
  const response = await fetch('/click-to-call', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      agentId,                    // ← Frontend provides
      calling_party_b: customerNumber, // ← Frontend provides
      entityId                    // ← Frontend provides
    })
  });
  return response.json();
};
```

### Backend Security Checklist
- [x] Agent phone fetched from `agent.phone`
- [x] IVR fetched from `agent.deskphone`
- [x] API key fetched from entity context
- [x] Entity ownership validated
- [x] CallLog created before call
- [x] Webhook updates CallLog status

---

**Document Version**: 2.0  
**Last Updated**: 2026-01-20  
**Maintained by**: Backend Team
